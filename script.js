// DOM Elements
const webcam = document.getElementById('webcam');
const cameraPopup = document.getElementById('cameraPopup');
const closePopup = document.getElementById('closePopup');
const retryBtn = document.getElementById('retryCamera');

// Enhanced popup handlers
function setupPopupHandlers() {
    try {
        const permPopup = document.getElementById('permissionPopup');
        const closePermPopup = document.getElementById('closePermPopup');
        const openSettingsBtn = document.getElementById('openSettings');
        const cameraPopup = document.getElementById('cameraPopup');
        const closePopup = document.getElementById('closePopup');
        const retryBtn = document.getElementById('retryCamera');

        if (permPopup && closePermPopup && openSettingsBtn) {
            closePermPopup.addEventListener('click', () => {
                permPopup.classList.add('hidden');
            });

            openSettingsBtn.addEventListener('click', () => {
                try {
                    // More detailed guidance for different browsers
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    const message = isMobile 
                        ? 'Go to Settings > Site Settings > Camera to enable permissions'
                        : 'Click the camera icon in your address bar to manage permissions';
                    alert(`Please enable camera access:\n${message}`);
                } catch (e) {
                    console.error('Error showing settings help:', e);
                    alert('Please check your browser settings to enable camera permissions.');
                }
            });
        }

        if (cameraPopup && closePopup && retryBtn) {
            closePopup.addEventListener('click', () => {
                cameraPopup.classList.add('hidden');
            });

            retryBtn.addEventListener('click', async () => {
                cameraPopup.classList.add('hidden');
                await setupCamera();
            });
        }
    } catch (error) {
        console.error('Error setting up popup handlers:', error);
    }
}
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
        
        // Check if popups exist before trying to show them
        const showPermissionPopup = () => {
            if (permPopup) {
                permPopup.classList.remove('hidden');
                return true;
            }
            return false;
        };

        const showCameraPopup = () => {
            if (cameraPopup) {
                cameraPopup.classList.remove('hidden');
                return true;
            }
            return false;
        };

        // Handle specific error cases
        if (error.name === 'NotAllowedError') {
            if (!showPermissionPopup()) {
                alert('Camera permission denied. Please enable camera access in your browser settings.');
            }
        } 
        else if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
            if (!showCameraPopup()) {
                alert('No compatible camera found. Please check your camera connection.');
            }
        }
        else {
            const errorMsg = `Camera Error: ${error.message}`;
            if (document.getElementById('errorToast')) {
                document.getElementById('errorToast').textContent = errorMsg;
                document.getElementById('errorToast').classList.remove('hidden');
                setTimeout(() => {
                    document.getElementById('errorToast').classList.add('hidden');
                }, 5000);
            } else {
                alert(errorMsg);
            }
        }
        return false;
    }
}

// Camera control functions
async function startCamera() {
    if (cameraPopup && !cameraPopup.classList.contains('hidden')) {
        return;
    }
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
