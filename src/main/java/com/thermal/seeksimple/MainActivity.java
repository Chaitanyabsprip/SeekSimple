package com.thermal.seeksimple;

import android.Manifest;
import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.ImageFormat;
import android.graphics.SurfaceTexture;
import android.graphics.Typeface;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CameraMetadata;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.TotalCaptureResult;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.media.Image;
import android.media.ImageReader;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;
import android.util.Size;
import android.util.SparseIntArray;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.thermal.seekware.CaptureResult;
import com.thermal.seekware.ColorPalettePicker;
import com.thermal.seekware.SeekCamera;
import com.thermal.seekware.SeekCameraManager;
import com.thermal.seekware.SeekImage;
import com.thermal.seekware.SeekMediaCapture;
import com.thermal.seekware.SeekPreview;
import com.thermal.seekware.SeekUtility;
import com.thermal.seekware.VideoCaptureRequest;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

//import android.support.annotation.NonNull;
//import android.support.v4.app.ActivityCompat;
//import android.support.v7.app.AppCompatActivity;
//class AndroidCameraApi extends AppCompatActivity {
//}
public class MainActivity extends AppCompatActivity {
//    private static final String TAG = "AndroidCameraApi";
    private TextureView textureView;
    private static final SparseIntArray ORIENTATIONS = new SparseIntArray();
    static {
        ORIENTATIONS.append(Surface.ROTATION_0, 90);
        ORIENTATIONS.append(Surface.ROTATION_90, 0);
        ORIENTATIONS.append(Surface.ROTATION_180, 270);
        ORIENTATIONS.append(Surface.ROTATION_270, 180);
    }
    private String cameraId;
    protected CameraDevice cameraDevice;
    protected CameraCaptureSession cameraCaptureSessions;
    protected CaptureRequest captureRequest;
    protected CaptureRequest.Builder captureRequestBuilder;
    private Size imageDimension;
    private ImageReader imageReader;
    private File file;
    private static final int REQUEST_CAMERA_PERMISSION = 200;
    private boolean mFlashSupported;
    private Handler mBackgroundHandler;
    private HandlerThread mBackgroundThread;
//    @Override
//    protected void onCreate(Bundle savedInstanceState) {
//        super.onCreate(savedInstanceState);
//        setContentView(R.layout.activity_android_camera_api);
//        textureView = (TextureView) findViewById(R.id.texture);
//        assert textureView != null;
//        textureView.setSurfaceTextureListener(textureListener);
//        assert takePictureButton != null;
//        takePictureButton.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//                takePicture();
//            }
//        });
//    }
    TextureView.SurfaceTextureListener textureListener = new TextureView.SurfaceTextureListener() {
        @Override
        public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
            //open your camera here
            openCamera();
        }
        @Override
        public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {
            // Transform you image captured size according to the surface width and height
        }
        @Override
        public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
            return false;
        }
        @Override
        public void onSurfaceTextureUpdated(SurfaceTexture surface) {
        }
    };
    private final CameraDevice.StateCallback stateCallback = new CameraDevice.StateCallback() {
        @Override
        public void onOpened(CameraDevice camera) {
            //This is called when the camera is open
            Log.e(TAG, "onOpened");
            cameraDevice = camera;
            createCameraPreview();
        }
        @Override
        public void onDisconnected(CameraDevice camera) {
            cameraDevice.close();
        }
        @Override
        public void onError(CameraDevice camera, int error) {
            cameraDevice.close();
            cameraDevice = null;
        }
    };
    final CameraCaptureSession.CaptureCallback captureCallbackListener = new CameraCaptureSession.CaptureCallback() {
        @Override
        public void onCaptureCompleted(CameraCaptureSession session, CaptureRequest request, TotalCaptureResult result) {
            super.onCaptureCompleted(session, request, result);
            Toast.makeText(MainActivity.this, "Saved:" + file, Toast.LENGTH_SHORT).show();
            createCameraPreview();
        }
    };
    protected void startBackgroundThread() {
        mBackgroundThread = new HandlerThread("Camera Background");
        mBackgroundThread.start();
        mBackgroundHandler = new Handler(mBackgroundThread.getLooper());
    }
    protected void stopBackgroundThread() {
        mBackgroundThread.quitSafely();
        try {
            mBackgroundThread.join();
            mBackgroundThread = null;
            mBackgroundHandler = null;
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    protected void takePicture() {
        if(null == cameraDevice) {
            Log.e(TAG, "cameraDevice is null");
            return;
        }
        CameraManager manager = (CameraManager) getSystemService(Context.CAMERA_SERVICE);
        try {
            CameraCharacteristics characteristics = manager.getCameraCharacteristics(cameraDevice.getId());
            Size[] jpegSizes = null;
            if (characteristics != null) {
                jpegSizes = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP).getOutputSizes(ImageFormat.JPEG);
            }
            int width = 640;
            int height = 480;
            if (jpegSizes != null && 0 < jpegSizes.length) {
                width = jpegSizes[0].getWidth();
                height = jpegSizes[0].getHeight();
            }
            ImageReader reader = ImageReader.newInstance(width, height, ImageFormat.JPEG, 1);
            List<Surface> outputSurfaces = new ArrayList<Surface>(2);
            outputSurfaces.add(reader.getSurface());
            outputSurfaces.add(new Surface(textureView.getSurfaceTexture()));
            final CaptureRequest.Builder captureBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE);
            captureBuilder.addTarget(reader.getSurface());
            captureBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);
            // Orientation
            int rotation = getWindowManager().getDefaultDisplay().getRotation();
            captureBuilder.set(CaptureRequest.JPEG_ORIENTATION, ORIENTATIONS.get(rotation));
            final File file = new File(Environment.getExternalStorageDirectory()+"/pic.jpg");
            ImageReader.OnImageAvailableListener readerListener = new ImageReader.OnImageAvailableListener() {
                @Override
                public void onImageAvailable(ImageReader reader) {
                    Image image = null;
                    try {
                        image = reader.acquireLatestImage();
                        ByteBuffer buffer = image.getPlanes()[0].getBuffer();
                        byte[] bytes = new byte[buffer.capacity()];
                        buffer.get(bytes);
                        save(bytes);
                    } catch (FileNotFoundException e) {
                        e.printStackTrace();
                    } catch (IOException e) {
                        e.printStackTrace();
                    } finally {
                        if (image != null) {
                            image.close();
                        }
                    }
                }
                private void save(byte[] bytes) throws IOException {
                    OutputStream output = null;
                    try {
                        output = new FileOutputStream(file);
                        output.write(bytes);
                    } finally {
                        if (null != output) {
                            output.close();
                        }
                    }
                }
            };
            reader.setOnImageAvailableListener(readerListener, mBackgroundHandler);
            final CameraCaptureSession.CaptureCallback captureListener = new CameraCaptureSession.CaptureCallback() {
                @Override
                public void onCaptureCompleted(CameraCaptureSession session, CaptureRequest request, TotalCaptureResult result) {
                    super.onCaptureCompleted(session, request, result);
                    Toast.makeText(MainActivity.this, "Saved:" + file, Toast.LENGTH_SHORT).show();
                    createCameraPreview();
                }
            };
            cameraDevice.createCaptureSession(outputSurfaces, new CameraCaptureSession.StateCallback() {
                @Override
                public void onConfigured(CameraCaptureSession session) {
                    try {
                        session.capture(captureBuilder.build(), captureListener, mBackgroundHandler);
                    } catch (CameraAccessException e) {
                        e.printStackTrace();
                    }
                }
                @Override
                public void onConfigureFailed(CameraCaptureSession session) {
                }
            }, mBackgroundHandler);
        } catch (CameraAccessException e) {
            e.printStackTrace();
        }
    }
    protected void createCameraPreview() {
        try {
            SurfaceTexture texture = textureView.getSurfaceTexture();
            assert texture != null;
            texture.setDefaultBufferSize(imageDimension.getWidth(), imageDimension.getHeight());
            Surface surface = new Surface(texture);
            captureRequestBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
            captureRequestBuilder.addTarget(surface);
            cameraDevice.createCaptureSession(Arrays.asList(surface), new CameraCaptureSession.StateCallback(){
                @Override
                public void onConfigured(@NonNull CameraCaptureSession cameraCaptureSession) {
                    //The camera is already closed
                    if (null == cameraDevice) {
                        return;
                    }
                    // When the session is ready, we start displaying the preview.
                    cameraCaptureSessions = cameraCaptureSession;
                    updatePreview();
                }
                @Override
                public void onConfigureFailed(@NonNull CameraCaptureSession cameraCaptureSession) {
                    Toast.makeText(MainActivity.this, "Configuration change", Toast.LENGTH_SHORT).show();
                }
            }, null);
        } catch (CameraAccessException e) {
            e.printStackTrace();
        }
    }
    private void openCamera() {
        CameraManager manager = (CameraManager) getSystemService(Context.CAMERA_SERVICE);
        Log.e(TAG, "is camera open");
        try {
            cameraId = manager.getCameraIdList()[0];
            CameraCharacteristics characteristics = manager.getCameraCharacteristics(cameraId);
            StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
            assert map != null;
            imageDimension = map.getOutputSizes(SurfaceTexture.class)[0];
            // Add permission for camera and let user grant the permission
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.CAMERA, Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQUEST_CAMERA_PERMISSION);
                return;
            }
            manager.openCamera(cameraId, stateCallback, null);
        } catch (CameraAccessException e) {
            e.printStackTrace();
        }
        Log.e(TAG, "openCamera X");
    }
    protected void updatePreview() {
        if(null == cameraDevice) {
            Log.e(TAG, "updatePreview error, return");
        }
        captureRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO);
        try {
            cameraCaptureSessions.setRepeatingRequest(captureRequestBuilder.build(), null, mBackgroundHandler);
        } catch (CameraAccessException e) {
            e.printStackTrace();
        }
    }
    private void closeCamera() {
        if (null != cameraDevice) {
            cameraDevice.close();
            cameraDevice = null;
        }
        if (null != imageReader) {
            imageReader.close();
            imageReader = null;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.e(TAG, "onResume");
        startBackgroundThread();
        if (textureView.isAvailable()) {
            openCamera();
        } else {
            textureView.setSurfaceTextureListener(textureListener);
        }
    }
    @Override
    protected void onPause() {
        Log.e(TAG, "onPause");
        //closeCamera();
        stopBackgroundThread();
        super.onPause();
    }

    /* Static Fields */
    private static final String TAG = MainActivity.class.getSimpleName();
    private static final @ColorInt
    int PHOTO_CAPTURE_BUTTON_COLOR = 0xFFFFFFFF;
    private static final @ColorInt
    int VIDEO_CAPTURE_BUTTON_COLOR = 0xFFFF0000;
    private static final int MEDIA_CAPTURE_SCALE_FACTOR = 4;
    private static final float PREVIEWS_PER_SCREEN = 5.5f;
    private static final int SHUTTER_SPEED_IN_MILLIS = 500;
    private boolean photo = true;

    private static final SeekCamera.ColorPalette[] luts = {
            SeekCamera.ColorPalette.TYRIAN,
            SeekCamera.ColorPalette.IRON2,
            SeekCamera.ColorPalette.RECON,
            SeekCamera.ColorPalette.BLACK_RECON,
            SeekCamera.ColorPalette.WHITEHOT,
            SeekCamera.ColorPalette.BLACKHOT,
            SeekCamera.ColorPalette.AMBER,
            SeekCamera.ColorPalette.GREEN,
            SeekCamera.ColorPalette.SPECTRA,
            SeekCamera.ColorPalette.HI,
            SeekCamera.ColorPalette.HILO,
            SeekCamera.ColorPalette.IRON,
            SeekCamera.ColorPalette.PRISM,
            SeekCamera.ColorPalette.USER0
    };

    private boolean initialized = false;

    private SeekCamera thermalCamera;
    private SeekCameraManager seekCameraManager;
    private SeekPreview seekPreview;
    private SeekMediaCapture seekMediaCapture;
    private SeekUtility.PermissionHandler permissionHandler;
    private SimpleOverlay simpleOverlay;
    private ImageButton switchButton;
    private ImageButton captureButton;
    private ImageButton stopButton;
    private TextView videoInfo;
    private ColorPalettePicker colorPalettePicker;
    private ImageView thermalOverlay;

    private SeekCamera.StateCallback seekStateCallback = new SeekCamera.StateCallbackAdapter() {
        @Override
        public synchronized void onOpened(SeekCamera seekCamera) {
            thermalCamera = seekCamera;
            SeekCamera.Characteristics characteristics = seekCamera.getCharacteristics();

            seekMediaCapture.setSize(characteristics.getHeight() * MEDIA_CAPTURE_SCALE_FACTOR,
                    characteristics.getWidth() * MEDIA_CAPTURE_SCALE_FACTOR);
            seekCamera.createSeekCameraCaptureSession(seekPreview, seekMediaCapture);
        }

        @Override
        public synchronized void onStarted(SeekCamera camera) {
            seekPreview.bringToFront();
        }

        @Override
        public synchronized void onStopped(final SeekCamera seekCamera) {
            thermalOverlay.bringToFront();
        }

        @Override
        public synchronized void onClosed(SeekCamera seekCamera) {
            thermalCamera = null;
            initialized = false;
        }
    };

    /**
     * Lets the PermissionHandler handle the permission callback.
     *
     * @param requestCode  request code associated with callback
     * @param permissions  permissions associated with callback
     * @param grantResults results associated with callback
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        permissionHandler.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_CAMERA_PERMISSION) {
            if (grantResults[0] == PackageManager.PERMISSION_DENIED) {
                // close the app
                Toast.makeText(MainActivity.this, "Sorry!!!, you can't use this app without granting permission", Toast.LENGTH_LONG).show();
                finish();
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {

//        setContentView(R.layout.activity_android_camera_api);


        //hide the title bar
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Objects.requireNonNull(getSupportActionBar()).hide();
        super.onCreate(savedInstanceState);

        //show the activity in full screen
        Window window = getWindow();
        window.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        // keep screen on
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setContentView(R.layout.activity_main);

        textureView = (TextureView) findViewById(R.id.texture);
        assert textureView != null;
        textureView.setSurfaceTextureListener(textureListener);
//        assert takePictureButton != null;
//        takePictureButton.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//                takePicture();
//            }
//        });
        simpleOverlay = new SimpleOverlay(this);

        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LOCKED);
        captureButton = findViewById(R.id.capture);
        switchButton = findViewById(R.id.switch_camera_video);
        seekPreview = findViewById(R.id.seek_preview);
        stopButton = findViewById(R.id.stop_record);
        colorPalettePicker = findViewById(R.id.color_lut_picker);
        videoInfo = findViewById(R.id.video_info);
        thermalOverlay = findViewById(R.id.thermal_overlay);
        colorPalettePicker.setVisibility(View.INVISIBLE);
        stopButton.setVisibility(View.INVISIBLE);
        captureButton.setOnLongClickListener(v -> {
            onCaptureLongClicked(v);
            return true;
        });
        seekPreview.initialize(true, simpleOverlay);
        seekPreview.setDetectionMode(SeekPreview.DetectionMode.ALL);
        seekPreview.setStateCallback(new SeekPreview.StateCallbackAdapter() {
            @Override
            public void onFrameAvailable(SeekPreview seekPreview, SeekImage seekImage) {
                if(!initialized){
                    initialized = true;
                    Size size = new Size((int) (seekPreview.getWidth() / PREVIEWS_PER_SCREEN), (int) (seekPreview.getWidth() / PREVIEWS_PER_SCREEN * 4f / 3f));
                    Typeface typeface = Typeface.createFromAsset(getAssets(), "Gotham Bold Regular.ttf");
                    ColorPalettePicker.LinearConfiguration linearConfiguration = new ColorPalettePicker.LinearConfiguration(getApplicationContext(),
                            Arrays.asList(luts), true, size, new ColorPalettePicker.TextAttributes.Builder().setTypeface(typeface).build());
                    colorPalettePicker.initialize(seekImage, linearConfiguration);
                }
                if(seekPreview.getFrameNumber() % 2 == 0 && colorPalettePicker.getVisibility() == View.VISIBLE){
                    colorPalettePicker.update();
                }
                updateVideoInfo();
            }
        });

        seekMediaCapture = new SeekMediaCapture(this, simpleOverlay);
        seekMediaCapture.setStateCallback(new SeekMediaCapture.StateCallbackAdapter() {
            @Override
            public void onPhotoTaken(SeekMediaCapture seekMediaCapture, CaptureResult result) {
                runOnUiThread(() -> {
                    Toast.makeText(getApplicationContext(), "Capture: " + result.filename, Toast.LENGTH_SHORT).show();
                    thermalOverlay.bringToFront();
                    thermalOverlay.animate().alpha(0).setDuration(SHUTTER_SPEED_IN_MILLIS).setInterpolator(new AccelerateDecelerateInterpolator()).setListener(new AnimatorListenerAdapter() {
                        @Override
                        public void onAnimationEnd(Animator animation) {
                            thermalOverlay.setAlpha(1.0f);
                            seekPreview.bringToFront();
                        }
                    }).start();
                });
            }

            @Override
            public void onVideoRecordingStarted(SeekMediaCapture seekMediaCapture, VideoCaptureRequest captureRequest) {
                runOnUiThread(() -> {
                    captureButton.setVisibility(View.INVISIBLE);
                    stopButton.setVisibility(View.VISIBLE);
                    Toast.makeText(getApplicationContext(), "Video Recording Started: " + captureRequest.filename, Toast.LENGTH_SHORT).show();
                });
            }

            @Override
            public void onVideoRecordingEnded(SeekMediaCapture seekMediaCapture, CaptureResult captureResult) {
                runOnUiThread(() -> {
                    captureButton.setVisibility(View.VISIBLE);
                    stopButton.setVisibility(View.INVISIBLE);
                    Toast.makeText(getApplicationContext(), "Video Recording Ended: " + captureResult.filename, Toast.LENGTH_SHORT).show();
                });
            }
        });
        seekCameraManager = new SeekCameraManager(this, null, seekStateCallback);

        // Create PermissionHandler
        permissionHandler = SeekUtility.PermissionHandler.getInstance();
        SeekUtility.OrientationManager.getInstance().addViews(findViewById(R.id.color_lut), switchButton);
    }

    private void updateVideoInfo(){
        runOnUiThread(() -> {
            if(seekMediaCapture.isRecording()){
                videoInfo.setText(SeekUtility.formatTime(seekMediaCapture.getElapsedTime(), 0, false));
            } else {
                videoInfo.setText("");
            }
        });
    }

    public void onCaptureClicked(View v) {
        if(photo){
            seekMediaCapture.takePhoto();
        } else {
            seekMediaCapture.startRecording();
        }
    }

    /**
     * Called when the stop button is clicked
     *
     * @param v view associated with callback
     */
    public void onStopClicked(View v) {
        seekMediaCapture.stopRecording();
    }

    /**
     * Called when the switch button is clicked
     *
     * @param v view associated with callback
     */
    public void onSwitchClicked(View v) {
        if (photo) {
            switchButton.setBackgroundResource(R.drawable.ic_switch_camera);
            captureButton.setBackgroundTintList(ColorStateList.valueOf(VIDEO_CAPTURE_BUTTON_COLOR));
            photo = false;
        } else {
            switchButton.setBackgroundResource(R.drawable.ic_switch_video);
            captureButton.setBackgroundTintList(ColorStateList.valueOf(PHOTO_CAPTURE_BUTTON_COLOR));
            photo = true;
        }
    }

    /**
     * Called when the color lut button is clicked
     *
     * @param v view associated with callback
     */
    public void onColorLutClicked(View v){
        colorPalettePicker.setVisibility(colorPalettePicker.getVisibility() == View.VISIBLE ? View.INVISIBLE : View.VISIBLE);
    }

    /**
     * Called when the capture button is long clicked
     *
     * @param v view associated with callback
     */
    public void onCaptureLongClicked(View v){
        if(thermalCamera != null){
            thermalCamera.triggerShutter();
            Toast.makeText(getApplicationContext(), "Shutter Triggered", Toast.LENGTH_SHORT).show();
        }
    }
}
