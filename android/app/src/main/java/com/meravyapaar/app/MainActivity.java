package com.meravyapaar.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int RECORD_AUDIO_REQUEST_CODE = 1001;
    private PermissionRequest pendingAudioPermissionRequest;

    @Override
    public void onStart() {
        super.onStart();

        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECORD_AUDIO
        ) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    RECORD_AUDIO_REQUEST_CODE
            );
        }

        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setWebChromeClient(
                    new WebChromeClient() {
                        @Override
                        public void onPermissionRequest(final PermissionRequest request) {
                            runOnUiThread(() -> {
                                if (request.getResources() != null) {
                                    for (String resource : request.getResources()) {
                                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                                            if (ContextCompat.checkSelfPermission(
                                                    MainActivity.this,
                                                    Manifest.permission.RECORD_AUDIO
                                            ) == PackageManager.PERMISSION_GRANTED) {
                                                request.grant(new String[]{
                                                        PermissionRequest.RESOURCE_AUDIO_CAPTURE
                                                });
                                            } else {
                                                pendingAudioPermissionRequest = request;
                                                ActivityCompat.requestPermissions(
                                                        MainActivity.this,
                                                        new String[]{Manifest.permission.RECORD_AUDIO},
                                                        RECORD_AUDIO_REQUEST_CODE
                                                );
                                            }
                                            return;
                                        }
                                    }
                                }

                                request.deny();
                            });
                        }
                    }
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == RECORD_AUDIO_REQUEST_CODE) {
            runOnUiThread(() -> {
                if (pendingAudioPermissionRequest != null) {
                    if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                        pendingAudioPermissionRequest.grant(new String[]{
                                PermissionRequest.RESOURCE_AUDIO_CAPTURE
                        });
                    } else {
                        pendingAudioPermissionRequest.deny();
                    }
                    pendingAudioPermissionRequest = null;
                }
            });
        }
    }
}
