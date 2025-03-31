// DOM Elements
const webcam = document.getElementById('webcam');
const loadingOverlay = document.getElementById('loadingOverlay');
const flipCamera = document.getElementById('flipCamera');
const startCameraBtn = document.getElementById('startCamera');
const stopCameraBtn = document.getElementById('stopCamera');

// Camera state
let currentStream = null;
let isBackCamera = false;

// Camera setup
async function setupCamera() {
    try {
        showLoading();
        
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: isBackCamera ? 'environment' : 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        webcam.srcObject = currentStream;
        
        await new Promise((resolve) => {
            webcam.onloadedmetadata = resolve;
        });

        hideLoading();
        return true;
    } catch (error) {
        console.error('Camera error:', error);
        hideLoading();
        alert(`Camera Error: ${error.message}`);
        return false;
    }
}

// Camera control functions
async function startCamera() {
    if (await setupCamera()) {
        startCameraBtn.disabled = true;
        stopCameraBtn.disabled = false;
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        webcam.srcObject = null;
        startCameraBtn.disabled = false;
        stopCameraBtn.disabled = true;
    }
}

async function flipCameraHandler() {
    isBackCamera = !isBackCamera;
    if (!stopCameraBtn.disabled) {
        await startCamera();
    }
}

// UI Helpers
function showLoading() {
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

// Initialize event listeners
function setupEventListeners() {
    if (flipCamera) flipCamera.addEventListener('click', flipCameraHandler);
    if (startCameraBtn) startCameraBtn.addEventListener('click', startCamera);
    if (stopCameraBtn) stopCameraBtn.addEventListener('click', stopCamera);
}

// Initialize app
async function init() {
    console.log("Initializing application...");
    setupEventListeners();
    stopCameraBtn.disabled = true;
}

// Start when ready
if (document.readyState === 'complete') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}