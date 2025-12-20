// js/camera.js
class CameraManager {
    constructor() {
        this.cameraPreview = document.getElementById('cameraPreview');
        this.captureCanvas = document.getElementById('captureCanvas');
        this.capturedImage = document.getElementById('capturedImage');
        this.startCameraBtn = document.getElementById('startCameraBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.retakeBtn = document.getElementById('retakeBtn');
        
        this.attendanceCamera = document.getElementById('attendanceCamera');
        this.startAttendanceCameraBtn = document.getElementById('startAttendanceCamera');
        this.stopAttendanceCameraBtn = document.getElementById('stopAttendanceCamera');
        
        this.capturedPhoto = null;
        this.stream = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Registration camera
        if (this.startCameraBtn) {
            this.startCameraBtn.addEventListener('click', () => this.startRegistrationCamera());
        }
        
        if (this.captureBtn) {
            this.captureBtn.addEventListener('click', () => this.capturePhoto());
        }
        
        if (this.retakeBtn) {
            this.retakeBtn.addEventListener('click', () => this.retakePhoto());
        }
        
        // Attendance camera
        if (this.startAttendanceCameraBtn) {
            this.startAttendanceCameraBtn.addEventListener('click', () => this.startAttendanceCamera());
        }
        
        if (this.stopAttendanceCameraBtn) {
            this.stopAttendanceCameraBtn.addEventListener('click', () => this.stopCamera());
        }
    }
    
    async startRegistrationCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            this.cameraPreview.srcObject = this.stream;
            
            // Update buttons
            this.startCameraBtn.disabled = true;
            this.captureBtn.disabled = false;
            
            // Show success message
            if (window.mainApp) {
                window.mainApp.showNotification('Camera started successfully', 'success');
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            if (window.mainApp) {
                window.mainApp.showNotification('Cannot access camera: ' + error.message, 'error');
            }
        }
    }
    
    async startAttendanceCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            this.attendanceCamera.srcObject = this.stream;
            
            // Update camera status
            const cameraStatus = document.getElementById('cameraStatus');
            if (cameraStatus) {
                cameraStatus.innerHTML = '<i class="fas fa-video"></i><span>Camera is active</span>';
                cameraStatus.style.backgroundColor = 'rgba(76, 201, 240, 0.7)';
            }
            
            // Update buttons
            this.startAttendanceCameraBtn.disabled = true;
            this.stopAttendanceCameraBtn.disabled = false;
            
            // Play scan sound
            const scanSound = document.getElementById('scanSound');
            if (scanSound) {
                scanSound.currentTime = 0;
                scanSound.play().catch(e => console.log('Audio play failed:', e));
            }
            
            // Show success message
            if (window.mainApp) {
                window.mainApp.showNotification('Attendance camera started', 'success');
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            if (window.mainApp) {
                window.mainApp.showNotification('Cannot access camera: ' + error.message, 'error');
            }
        }
    }
    
    capturePhoto() {
        if (!this.stream) return;
        
        const context = this.captureCanvas.getContext('2d');
        this.captureCanvas.width = this.cameraPreview.videoWidth;
        this.captureCanvas.height = this.cameraPreview.videoHeight;
        
        // Draw current frame
        context.drawImage(this.cameraPreview, 0, 0);
        
        // Convert to base64
        this.capturedPhoto = this.captureCanvas.toDataURL('image/jpeg', 0.8);
        
        // Display captured image
        this.capturedImage.src = this.capturedPhoto;
        this.capturedImage.style.display = 'block';
        
        // Update UI
        document.getElementById('capturedPreview').querySelector('p').style.display = 'none';
        this.captureBtn.disabled = true;
        this.retakeBtn.disabled = false;
        
        // Update confirmation summary
        document.getElementById('confirmImageStatus').textContent = 'Captured ✓';
        
        // Play capture sound
        const scanSound = document.getElementById('scanSound');
        if (scanSound) {
            scanSound.currentTime = 0;
            scanSound.play().catch(e => console.log('Audio play failed:', e));
        }
        
        if (window.mainApp) {
            window.mainApp.showNotification('Face image captured successfully', 'success');
        }
    }
    
    retakePhoto() {
        this.capturedPhoto = null;
        this.capturedImage.style.display = 'none';
        document.getElementById('capturedPreview').querySelector('p').style.display = 'block';
        this.captureBtn.disabled = false;
        this.retakeBtn.disabled = true;
        document.getElementById('confirmImageStatus').textContent = 'Not captured';
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        // Update UI
        if (this.cameraPreview) {
            this.cameraPreview.srcObject = null;
        }
        
        if (this.attendanceCamera) {
            this.attendanceCamera.srcObject = null;
        }
        
        if (this.startCameraBtn) {
            this.startCameraBtn.disabled = false;
        }
        
        if (this.captureBtn) {
            this.captureBtn.disabled = true;
        }
        
        if (this.retakeBtn) {
            this.retakeBtn.disabled = true;
        }
        
        if (this.startAttendanceCameraBtn) {
            this.startAttendanceCameraBtn.disabled = false;
        }
        
        if (this.stopAttendanceCameraBtn) {
            this.stopAttendanceCameraBtn.disabled = true;
        }
        
        // Update camera status
        const cameraStatus = document.getElementById('cameraStatus');
        if (cameraStatus) {
            cameraStatus.innerHTML = '<i class="fas fa-video-slash"></i><span>Camera is off</span>';
            cameraStatus.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        }
    }
    
    getCapturedPhoto() {
        return this.capturedPhoto;
    }
    
    simulateFaceDetection() {
        // This is a simulation - in real system, this would use AI face recognition
        const students = storage.getStudents();
        const simulationMode = document.getElementById('simulationMode')?.value || 'random';
        
        let result;
        
        switch(simulationMode) {
            case 'random':
                // Randomly recognize or not
                if (Math.random() > 0.3) { // 70% chance of recognition
                    const randomStudent = students[Math.floor(Math.random() * students.length)];
                    result = {
                        recognized: true,
                        student: randomStudent,
                        confidence: Math.floor(Math.random() * 30) + 70 // 70-100% confidence
                    };
                } else {
                    result = {
                        recognized: false,
                        confidence: Math.floor(Math.random() * 30) + 40 // 40-70% confidence
                    };
                }
                break;
                
            case 'specific':
                // Recognize specific student
                const studentSelect = document.getElementById('specificStudent');
                if (studentSelect && studentSelect.value) {
                    const student = students.find(s => s.id === studentSelect.value);
                    if (student) {
                        result = {
                            recognized: true,
                            student: student,
                            confidence: 95
                        };
                    } else {
                        result = {
                            recognized: false,
                            confidence: 60
                        };
                    }
                } else {
                    result = {
                        recognized: false,
                        confidence: 50
                    };
                }
                break;
                
            case 'unrecognized':
                // Always unrecognized
                result = {
                    recognized: false,
                    confidence: Math.floor(Math.random() * 30) + 30 // 30-60% confidence
                };
                break;
        }
        
        return result;
    }
}

// Initialize camera manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cameraManager = new CameraManager();
});