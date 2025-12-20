// js/attendance.js
class AttendanceManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTodayAttendance();
        this.populateStudentDropdown();
    }
    
    setupEventListeners() {
        // Simulate scan button
        const simulateScanBtn = document.getElementById('simulateScan');
        if (simulateScanBtn) {
            simulateScanBtn.addEventListener('click', () => this.simulateFaceScan());
        }
        
        // Export today's attendance
        const exportTodayBtn = document.getElementById('exportTodayBtn');
        if (exportTodayBtn) {
            exportTodayBtn.addEventListener('click', () => this.exportTodayAttendanceCSV());
        }
        
        // Refresh attendance
        const refreshBtn = document.getElementById('refreshAttendance');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadTodayAttendance();
                if (window.mainApp) {
                    window.mainApp.showNotification('Attendance refreshed', 'success');
                }
            });
        }
        
        // Simulation mode change
        const simulationMode = document.getElementById('simulationMode');
        if (simulationMode) {
            simulationMode.addEventListener('change', (e) => {
                const specificGroup = document.getElementById('specificStudentGroup');
                if (e.target.value === 'specific') {
                    specificGroup.style.display = 'block';
                } else {
                    specificGroup.style.display = 'none';
                }
            });
        }
    }
    
    simulateFaceScan() {
        const cameraStatus = document.getElementById('cameraStatus');
        if (cameraStatus && !cameraStatus.innerHTML.includes('active')) {
            if (window.mainApp) {
                window.mainApp.showNotification('Please start the camera first', 'error');
            }
            return;
        }
        
        // Play scan sound
        const scanSound = document.getElementById('scanSound');
        if (scanSound) {
            scanSound.currentTime = 0;
            scanSound.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Show scanning animation
        const resultContent = document.getElementById('recognitionResult');
        resultContent.innerHTML = `
            <div class="scanning">
                <i class="fas fa-search" style="font-size: 48px; color: var(--info-color);"></i>
                <p>Scanning face...</p>
                <div class="loading-spinner"></div>
            </div>
        `;
        
        // Simulate processing delay
        setTimeout(() => {
            const result = window.cameraManager.simulateFaceDetection();
            this.processScanResult(result);
        }, 1500);
    }
    
    processScanResult(result) {
        const resultContent = document.getElementById('recognitionResult');
        
        if (result.recognized && result.student) {
            // Mark attendance for recognized student
            const attendanceResult = this.markAttendance(result.student, 'face_recognition');
            
            if (attendanceResult.success) {
                resultContent.innerHTML = `
                    <div class="scan-success">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h4>✅ Recognized</h4>
                        <p><strong>${result.student.fullName}</strong></p>
                        <p>Roll: ${result.student.rollNumber}</p>
                        <p>Faculty: ${result.student.faculty}</p>
                        <p>Semester: ${result.student.semester}</p>
                        <p>Confidence: ${result.confidence}%</p>
                        <div class="timestamp">${new Date().toLocaleTimeString()}</div>
                    </div>
                `;
                
                // Add to recent scans
                this.addRecentScan({
                    student: result.student,
                    status: 'recognized',
                    confidence: result.confidence,
                    time: new Date().toLocaleTimeString()
                });
                
                if (window.mainApp) {
                    window.mainApp.showNotification(`Attendance marked for ${result.student.fullName}`, 'success');
                }
            } else {
                resultContent.innerHTML = `
                    <div class="scan-error">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <h4>⚠️ Already Marked</h4>
                        <p>Attendance already marked for today</p>
                        <p><strong>${result.student.fullName}</strong></p>
                        <p>Roll: ${result.student.rollNumber}</p>
                    </div>
                `;
                
                // Add to recent scans
                this.addRecentScan({
                    student: result.student,
                    status: 'already_marked',
                    confidence: result.confidence,
                    time: new Date().toLocaleTimeString()
                });
                
                if (window.mainApp) {
                    window.mainApp.showNotification(attendanceResult.message, 'error');
                }
            }
        } else {
            // Unrecognized face
            resultContent.innerHTML = `
                <div class="scan-failure">
                    <div class="failure-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h4>❌ Not Recognized</h4>
                    <p>Face not found in database</p>
                    <p>Confidence: ${result.confidence}%</p>
                    <div class="timestamp">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            
            // Add to recent scans
            this.addRecentScan({
                student: null,
                status: 'unrecognized',
                confidence: result.confidence,
                time: new Date().toLocaleTimeString()
            });
            
            if (window.mainApp) {
                window.mainApp.showNotification('Face not recognized', 'error');
            }
        }
        
        // Update today's attendance list
        this.loadTodayAttendance();
        
        // Update dashboard
        if (window.mainApp) {
            window.mainApp.updateDashboard();
        }
    }
    
    markAttendance(student, method = 'face_recognition') {
        const record = {
            studentId: student.id,
            rollNumber: student.rollNumber,
            fullName: student.fullName,
            faculty: student.faculty,
            semester: student.semester,
            section: student.section,
            status: 'present',
            method: method
        };
        
        return storage.markAttendance(record);
    }
    
    addRecentScan(scan) {
        const container = document.getElementById('recentScans');
        if (!container) return;
        
        const scanElement = document.createElement('div');
        scanElement.className = 'scan-item';
        
        if (scan.student) {
            scanElement.innerHTML = `
                <div>
                    <strong>${scan.student.fullName}</strong>
                    <div style="font-size: 12px; color: var(--text-light);">${scan.student.rollNumber}</div>
                </div>
                <div>
                    <span class="scan-status ${scan.status === 'recognized' ? 'recognized' : 'already_marked'}">
                        ${scan.status === 'recognized' ? '✅' : '⚠️'} ${scan.time}
                    </span>
                </div>
            `;
        } else {
            scanElement.innerHTML = `
                <div>
                    <strong>Unknown Person</strong>
                    <div style="font-size: 12px; color: var(--text-light);">Not in database</div>
                </div>
                <div>
                    <span class="scan-status unrecognized">
                        ❌ ${scan.time}
                    </span>
                </div>
            `;
        }
        
        // Add to top
        container.insertBefore(scanElement, container.firstChild);
        
        // Limit to 5 recent scans
        const scans = container.querySelectorAll('.scan-item');
        if (scans.length > 5) {
            container.removeChild(scans[scans.length - 1]);
        }
    }
    
    loadTodayAttendance() {
        const attendance = storage.getTodaysAttendance();
        const container = document.getElementById('todayAttendance');
        
        if (!container) return;
        
        if (attendance.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-light); padding: 40px;">
                        <i class="fas fa-calendar-day" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        No attendance marked today
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by time (newest first)
        const sortedAttendance = [...attendance].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        container.innerHTML = sortedAttendance.map(record => `
            <tr>
                <td>${record.time}</td>
                <td>${record.rollNumber}</td>
                <td>${record.fullName}</td>
                <td>${record.faculty}</td>
                <td>
                    <span class="scan-status ${record.status}">
                        ${record.status === 'present' ? '✅ Present' : '❌ Absent'}
                    </span>
                </td>
                <td>
                    <span style="font-size: 12px; color: var(--text-light);">
                        ${record.method === 'face_recognition' ? 'Face Recognition' : 'Manual'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    populateStudentDropdown() {
        const select = document.getElementById('specificStudent');
        if (!select) return;
        
        const students = storage.getStudents();
        
        select.innerHTML = '<option value="">Select a student</option>' + 
            students.map(student => 
                `<option value="${student.id}">${student.rollNumber} - ${student.fullName}</option>`
            ).join('');
    }
    
    exportTodayAttendanceCSV() {
        const attendance = storage.getTodaysAttendance();
        
        if (attendance.length === 0) {
            if (window.mainApp) {
                window.mainApp.showNotification('No attendance records to export today', 'error');
            }
            return;
        }
        
        // Create CSV headers
        const headers = ['Time', 'Roll Number', 'Name', 'Faculty', 'Semester', 'Section', 'Status', 'Method', 'Date'];
        
        // Create CSV rows
        const rows = attendance.map(record => [
            record.time,
            record.rollNumber,
            record.fullName,
            record.faculty,
            record.semester,
            record.section,
            record.status,
            record.method === 'face_recognition' ? 'Face Recognition' : 'Manual',
            record.date
        ]);
        
        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (window.mainApp) {
            window.mainApp.showNotification('Today\'s attendance exported successfully', 'success');
        }
    }
}

// Initialize attendance manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceManager = new AttendanceManager();
});