package com.meravyapaar.app;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.ai.edge.litertlm.Backend;
import com.google.ai.edge.litertlm.Conversation;
import com.google.ai.edge.litertlm.ConversationConfig;
import com.google.ai.edge.litertlm.Engine;
import com.google.ai.edge.litertlm.EngineConfig;
import com.google.ai.edge.litertlm.Message;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "LocalAI")
public class LocalAIPlugin extends Plugin {
    private static final String TAG = "MeraVyapaarLocalAI";

    // Runtime-downloadable Qwen3 1.7B LiteRT-LM artifact (~977 MB).
    private static final String MODEL_URL =
            "https://huggingface.co/litert-community/Qwen3-1.7B/resolve/main/Qwen3-1.7B_dynamic_wi4b32_afp32.litertlm?download=true";
    private static final String MODEL_FILE_NAME =
            "Qwen3-1.7B_dynamic_wi4b32_afp32.litertlm";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Object engineLock = new Object();

    private Engine engine;
    private Conversation conversation;

    private File getModelFile() {
        File modelDir = new File(getContext().getFilesDir(), "offline-ai");
        if (!modelDir.exists() && !modelDir.mkdirs()) {
            throw new IllegalStateException("Could not create offline AI model directory");
        }
        return new File(modelDir, MODEL_FILE_NAME);
    }

    @PluginMethod
    public void isModelAvailable(PluginCall call) {
        try {
            File model = getModelFile();
            JSObject result = new JSObject();
            result.put("available", model.isFile() && model.length() > 100_000_000L);
            result.put("sizeBytes", model.isFile() ? model.length() : 0);
            call.resolve(result);
        } catch (Exception e) {
            call.reject(e.getMessage() != null ? e.getMessage() : "Could not inspect offline AI model");
        }
    }

    @PluginMethod
    public void downloadModel(final PluginCall call) {
        executor.execute(() -> {
            try {
                File model = getModelFile();
                if (model.isFile() && model.length() > 100_000_000L) {
                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("path", model.getAbsolutePath());
                    result.put("sizeBytes", model.length());
                    call.resolve(result);
                    return;
                }

                File partial = new File(model.getAbsolutePath() + ".part");
                long existingBytes = partial.isFile() ? partial.length() : 0L;

                HttpURLConnection connection = null;
                try {
                    connection = (HttpURLConnection) new URL(MODEL_URL).openConnection();
                    connection.setConnectTimeout(30_000);
                    connection.setReadTimeout(60_000);
                    connection.setInstanceFollowRedirects(true);
                    connection.setRequestProperty("User-Agent", "MeraVyapaar/1.0");
                    if (existingBytes > 0) {
                        connection.setRequestProperty("Range", "bytes=" + existingBytes + "-");
                    }

                    int status = connection.getResponseCode();

                    if (existingBytes > 0 && status != HttpURLConnection.HTTP_PARTIAL) {
                        connection.disconnect();
                        existingBytes = 0L;
                        if (partial.exists() && !partial.delete()) {
                            throw new IOException("Could not reset partial model download");
                        }

                        connection = (HttpURLConnection) new URL(MODEL_URL).openConnection();
                        connection.setConnectTimeout(30_000);
                        connection.setReadTimeout(60_000);
                        connection.setInstanceFollowRedirects(true);
                        connection.setRequestProperty("User-Agent", "MeraVyapaar/1.0");
                        status = connection.getResponseCode();
                    }

                    if (status < 200 || status >= 300) {
                        throw new IOException("Model download failed with HTTP " + status);
                    }

                    long responseLength = connection.getContentLengthLong();
                    long totalBytes = responseLength > 0 ? existingBytes + responseLength : -1L;

                    try (InputStream raw = new BufferedInputStream(connection.getInputStream());
                         FileOutputStream output = new FileOutputStream(partial, existingBytes > 0)) {
                        byte[] buffer = new byte[1024 * 1024];
                        long downloaded = existingBytes;
                        long lastNotified = -1;

                        while (true) {
                            int read = raw.read(buffer);
                            if (read == -1) break;

                            output.write(buffer, 0, read);
                            downloaded += read;

                            if (totalBytes > 0) {
                                int percent = (int) Math.min(100, (downloaded * 100L) / totalBytes);
                                if (percent != lastNotified) {
                                    lastNotified = percent;
                                    JSObject progress = new JSObject();
                                    progress.put("downloadedBytes", downloaded);
                                    progress.put("totalBytes", totalBytes);
                                    progress.put("percent", percent);
                                    notifyListeners("modelDownloadProgress", progress);
                                }
                            }
                        }
                    }

                    if (!partial.renameTo(model)) {
                        throw new IOException("Could not finalize downloaded offline AI model");
                    }

                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("path", model.getAbsolutePath());
                    result.put("sizeBytes", model.length());
                    call.resolve(result);
                } finally {
                    if (connection != null) connection.disconnect();
                }
            } catch (Exception e) {
                Log.e(TAG, "Offline AI model download failed", e);
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("error", e.getMessage() != null ? e.getMessage() : "Offline AI model download failed");
                call.resolve(result);
            }
        });
    }

    @PluginMethod
    public void generate(final PluginCall call) {
        final String prompt = call.getString("prompt", "");
        if (prompt == null || prompt.trim().isEmpty()) {
            call.reject("Offline AI prompt is empty");
            return;
        }

        executor.execute(() -> {
            try {
                File model = getModelFile();
                if (!model.isFile() || model.length() <= 100_000_000L) {
                    call.reject("Offline AI model is not installed yet");
                    return;
                }

                Message response;
                synchronized (engineLock) {
                    ensureEngine(model);
                    if (conversation == null) {
                        conversation = engine.createConversation(new ConversationConfig());
                    }

                    // Synchronous generation is intentional for the first integration.
                    // It avoids the current LiteRT-LM Android streaming completion issue.
                    response = conversation.sendMessage(prompt);
                }

                String text = response != null ? response.toString() : "";
                if (text == null || text.trim().isEmpty()) {
                    call.reject("Offline AI returned an empty response");
                    return;
                }

                JSObject result = new JSObject();
                result.put("success", true);
                result.put("reply", text.trim());
                result.put("model", "Qwen3 1.7B (on-device)");
                call.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Offline AI generation failed", e);
                synchronized (engineLock) {
                    closeEngineLocked();
                }
                call.reject(e.getMessage() != null ? e.getMessage() : "Offline AI generation failed");
            }
        });
    }

    private void ensureEngine(File model) {
        synchronized (engineLock) {
            if (engine != null) return;

            try {
                EngineConfig gpuConfig = new EngineConfig(model.getAbsolutePath(), new Backend.GPU(), null, null, 4096, 512, getContext().getCacheDir().getAbsolutePath());
                engine = new Engine(gpuConfig);
                engine.initialize();
                Log.i(TAG, "Qwen3 initialized with GPU backend");
            } catch (Exception gpuError) {
                Log.w(TAG, "GPU backend unavailable; retrying with CPU", gpuError);
                closeEngineLocked();

                EngineConfig cpuConfig = new EngineConfig(model.getAbsolutePath(), new Backend.CPU(), null, null, 4096, 512, getContext().getCacheDir().getAbsolutePath());
                engine = new Engine(cpuConfig);
                engine.initialize();
                Log.i(TAG, "Qwen3 initialized with CPU backend");
            }
        }
    }

    private void closeEngineLocked() {
        try {
            if (conversation != null) {
                conversation.close();
            }
        } catch (Exception ignored) {
        }
        conversation = null;

        try {
            if (engine != null) {
                engine.close();
            }
        } catch (Exception ignored) {
        }
        engine = null;
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        executor.shutdownNow();
        synchronized (engineLock) {
            closeEngineLocked();
        }
    }
}
