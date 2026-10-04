package com.meravyapaar.app;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.devanagari.DevanagariTextRecognizerOptions;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

@CapacitorPlugin(name = "ReceiptOcr")
public class ReceiptOcrPlugin extends Plugin {

    @PluginMethod
    public void scan(PluginCall call) {
        String image = call.getString("image", "");
        String language = call.getString("language", "en");

        if (image == null || image.trim().isEmpty()) {
            call.reject("Receipt image is empty");
            return;
        }

        if (!"en".equals(language) && !"hi".equals(language) && !"mr".equals(language)) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", "ML Kit Text Recognition v2 does not provide native-script OCR for Telugu, Tamil, or Bengali. Use an English-script receipt or enter the details manually.");
            result.put("languageSupported", false);
            call.resolve(result);
            return;
        }

        try {
            String cleanBase64 = image.replaceFirst("^data:image/[^;]+;base64,", "");
            byte[] imageBytes = Base64.decode(cleanBase64, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);

            if (bitmap == null) {
                call.reject("Could not decode receipt image");
                return;
            }

            InputImage inputImage = InputImage.fromBitmap(bitmap, 0);
            final TextRecognizer recognizer;

            if ("hi".equals(language) || "mr".equals(language)) {
                recognizer = TextRecognition.getClient(
                        new DevanagariTextRecognizerOptions.Builder().build()
                );
            } else {
                recognizer = TextRecognition.getClient(
                        TextRecognizerOptions.DEFAULT_OPTIONS
                );
            }

            recognizer.process(inputImage)
                    .addOnSuccessListener(new OnSuccessListener<Text>() {
                        @Override
                        public void onSuccess(Text visionText) {
                            try {
                                String extracted = visionText.getText() == null ? "" : visionText.getText().trim();

                                JSObject result = new JSObject();
                                result.put("success", !extracted.isEmpty());
                                result.put("text", extracted);
                                result.put("engine", "ML-Kit-On-Device");
                                result.put("language", language);
                                result.put("languageSupported", true);

                                if (extracted.isEmpty()) {
                                    result.put("error", "No text detected in receipt image");
                                }

                                call.resolve(result);
                            } finally {
                                recognizer.close();
                            }
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            try {
                                call.reject(
                                        e.getMessage() != null
                                                ? e.getMessage()
                                                : "ML Kit receipt OCR failed"
                                );
                            } finally {
                                recognizer.close();
                            }
                        }
                    });
        } catch (Exception e) {
            call.reject(e.getMessage() != null ? e.getMessage() : "ML Kit receipt OCR failed");
        }
    }
}
