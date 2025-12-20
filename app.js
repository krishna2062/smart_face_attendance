// js/main.js
class MainApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.loadDemoDataIfNeeded();
        this.showSection('dashboard');
        this.updateDashboard();
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.showSection(section);
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Update page title
                this.updatePageTitle(section);
            });
        });
    }
    
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Update page title
            this.updatePageTitle(sectionId);
            
            // Load section-specific data
            this.loadSectionData(sectionId);
        }
    }
    
    updatePageTitle(sectionId) {
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        
        if (!pageTitle || !pageSubtitle) return;
        
        const titles = {
            dashboard: { main: 'Dashboard', sub: 'Attendance Overview' },
            register: { main: 'Register Student', sub: 'Add new students with face data' },
            attendance: { main: 'Take Attendance', sub: 'Automatic face recognition' },
            reports: { main: 'Reports', sub: 'Attendance analytics and reports' },
            settings: { main: 'Settings', sub: 'System configuration' },
            upgrade: { main: 'Future Enhancements', sub: 'Production deployment guide' }
        };
        
        const title = titles[sectionId] || { main: 'Dashboard', sub: 'Automatic Face Attendance System' };
        pageTitle.textContent = title.main;
        pageSubtitle.textContent = title.sub;
    }
    
    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'register':
                if (window.studentsManager) {
                    window.studentsManager.loadStudentsList();
                }
                break;
            case 'attendance':
                if (window.attendanceManager) {
                    window.attendanceManager.loadTodayAttendance();
                    window.attendanceManager.populateStudentDropdown();
                }
                break;
            case 'reports':
                if (window.reportsManager) {
                    window.reportsManager.init();
                }
                break;
            case 'settings':
                this.loadSettings();
                this.updateStorageStats();
                break;
        }
    }
    
    updateDashboard() {
        const students = storage.getStudents();
        const todayAttendance = storage.getTodaysAttendance();
        
        // Update stats
        document.getElementById('totalStudents').textContent = students.length;
        // Students with face data
        const faceCount = students.filter(s => s.faceImage).length;
        const facesEl = document.getElementById('studentsWithFaces');
        if (facesEl) facesEl.textContent = faceCount;
        
        const presentCount = todayAttendance.filter(a => a.status === 'present').length;
        const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
        const totalCount = students.length;
        
        document.getElementById('presentToday').textContent = presentCount;
        document.getElementById('absentToday').textContent = absentCount;
        
        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        document.getElementById('attendanceRate').textContent = attendanceRate + '%';
        
        // Update summary
        document.getElementById('presentCount').textContent = presentCount;
        document.getElementById('absentCount').textContent = absentCount;
        document.getElementById('totalCount').textContent = totalCount;
        
        // Update progress bar
        const progressPercent = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
        const progressBar = document.getElementById('attendanceProgress');
        const progressPercentText = document.getElementById('progressPercent');
        
        if (progressBar) {
            progressBar.style.width = progressPercent + '%';
        }
        if (progressPercentText) {
            progressPercentText.textContent = Math.round(progressPercent) + '%';
        }
        
        // Update recent attendance
        this.updateRecentAttendance(todayAttendance);
    }
    
    updateRecentAttendance(attendance) {
        const container = document.getElementById('recentAttendance');
        if (!container) return;
        
        // Sort by timestamp (newest first)
        const sortedAttendance = [...attendance].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        ).slice(0, 10); // Show only last 10
        
        if (sortedAttendance.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-light); padding: 40px;">
                        <i class="fas fa-history" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        No attendance records today
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = sortedAttendance.map(record => `
            <tr>
                <td>${record.time}</td>
                <td>${record.fullName}</td>
                <td>${record.rollNumber}</td>
                <td>${record.faculty}</td>
                <td>
                    <span class="scan-status ${record.status}">
                        ${record.status === 'present' ? '✅ Present' : '❌ Absent'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    loadSettings() {
        const settings = storage.getSettings();
        
        // Update checkboxes
        const autoStartCamera = document.getElementById('autoStartCamera');
        const enableSound = document.getElementById('enableSound');
        const notifySuccess = document.getElementById('notifySuccess');
        const notifyError = document.getElementById('notifyError');
        
        if (autoStartCamera) autoStartCamera.checked = settings.autoStartCamera !== false;
        if (enableSound) enableSound.checked = settings.enableSound !== false;
        if (notifySuccess) notifySuccess.checked = settings.notifySuccess !== false;
        if (notifyError) notifyError.checked = settings.notifyError !== false;
    }
    
    updateStorageStats() {
        const stats = storage.getStorageStats();
        
        document.getElementById('statStudents').textContent = stats.totalStudents;
        document.getElementById('statAttendance').textContent = stats.totalAttendance;
        // Storage used display removed
    }
    
    loadDemoDataIfNeeded() {
        // Commented out to prevent unwanted demo data loading
        /*
        if (!storage.isDemoDataLoaded()) {
            storage.loadDemoData();
            this.showNotification('Demo data loaded successfully!', 'success');
        }
        */
    }
    
    setupEventListeners() {
        // Refresh dashboard button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateDashboard();
                this.showNotification('Dashboard refreshed', 'success');
            });
        }
        
        // Reset demo data button
        const resetBtn = document.getElementById('resetDemoBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all data and reload demo data?')) {
                    storage.clearAllData();
                    storage.loadDemoData();
                    this.updateDashboard();
                    this.showNotification('Demo data reset successfully', 'success');
                    
                    // Reload current section
                    this.loadSectionData(this.currentSection);
                }
            });
        }
        
        // Clear all data button
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('⚠️ WARNING: This will delete ALL data including students and attendance records. This action cannot be undone. Are you sure?')) {
                    storage.clearAllData();
                    this.updateDashboard();
                    this.updateStorageStats();
                    this.showNotification('All data cleared successfully', 'success');
                }
            });
        }
        
        // Load demo data button
        const loadDemoBtn = document.getElementById('loadDemoDataBtn');
        if (loadDemoBtn) {
            loadDemoBtn.addEventListener('click', () => {
                storage.loadDemoData();
                this.updateDashboard();
                this.updateStorageStats();
                this.showNotification('Demo data loaded successfully', 'success');
                
                // Reload current section
                this.loadSectionData(this.currentSection);
            });
        }
        
        // Settings checkboxes
        const settingsCheckboxes = ['autoStartCamera', 'enableSound', 'notifySuccess', 'notifyError'];
        settingsCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    const settings = storage.getSettings();
                    settings[id] = checkbox.checked;
                    storage.saveSettings(settings);
                });
            }
        });
    }
    
    showNotification(message, type = 'info') {
        // Play sound if enabled
        const settings = storage.getSettings();
        if (settings.enableSound) {
            const sound = document.getElementById(type === 'success' ? 'successSound' : 'errorSound');
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('Audio play failed:', e));
            }
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            backgroundColor: type === 'success' ? 'var(--success-color)' : 
                           type === 'error' ? 'var(--danger-color)' : 'var(--info-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: '9999',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideIn 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Add animation styles
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize main app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mainApp = new MainApp();
});