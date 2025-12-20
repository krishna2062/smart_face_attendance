// js/storage.js
class StorageManager {
    constructor() {
        this.STORAGE_KEYS = {
            STUDENTS: 'face_attendance_students_v1',
            ATTENDANCE: 'face_attendance_records_v1',
            SETTINGS: 'face_attendance_settings_v1',
            DEMO_DATA_LOADED: 'face_attendance_demo_loaded_v1'
        };
        
        this.initializeStorage();
    }
    
    initializeStorage() {
        // Initialize empty storage if it doesn't exist
        if (!localStorage.getItem(this.STORAGE_KEYS.STUDENTS)) {
            localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE)) {
            localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) {
            const defaultSettings = {
                theme: 'light',
                autoStartCamera: true,
                enableSound: true,
                notifySuccess: true,
                notifyError: true
            };
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        }
    }
    
    // Student Methods
    getStudents() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STUDENTS)) || [];
        } catch (error) {
            console.error('Error reading students:', error);
            return [];
        }
    }
    
    saveStudent(student) {
        try {
            const students = this.getStudents();
            
            // Check for duplicate roll number
            const duplicate = students.find(s => s.rollNumber === student.rollNumber);
            if (duplicate) {
                return { success: false, message: 'Roll number already exists' };
            }
            
            students.push({
                ...student,
                id: this.generateId(),
                registeredDate: new Date().toISOString()
            });
            
            localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));
            return { success: true, message: 'Student saved successfully' };
        } catch (error) {
            console.error('Error saving student:', error);
            return { success: false, message: 'Error saving student' };
        }
    }
    
    updateStudent(id, updatedData) {
        try {
            const students = this.getStudents();
            const index = students.findIndex(s => s.id === id);
            
            if (index === -1) {
                return { success: false, message: 'Student not found' };
            }
            
            students[index] = { ...students[index], ...updatedData };
            localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));
            return { success: true, message: 'Student updated successfully' };
        } catch (error) {
            console.error('Error updating student:', error);
            return { success: false, message: 'Error updating student' };
        }
    }
    
    deleteStudent(id) {
        try {
            let students = this.getStudents();
            students = students.filter(s => s.id !== id);
            localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));
            return { success: true, message: 'Student deleted successfully' };
        } catch (error) {
            console.error('Error deleting student:', error);
            return { success: false, message: 'Error deleting student' };
        }
    }
    
    getStudentByRollNumber(rollNumber) {
        const students = this.getStudents();
        return students.find(s => s.rollNumber === rollNumber);
    }
    
    // Attendance Methods
    getAttendanceRecords() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ATTENDANCE)) || [];
        } catch (error) {
            console.error('Error reading attendance:', error);
            return [];
        }
    }
    
    markAttendance(record) {
        try {
            const records = this.getAttendanceRecords();
            const today = new Date().toISOString().split('T')[0];
            
            // Check if attendance already marked for today
            const alreadyMarked = records.find(r => 
                r.studentId === record.studentId && 
                r.date === today
            );
            
            if (alreadyMarked) {
                return { success: false, message: 'Attendance already marked for today' };
            }
            
            records.push({
                ...record,
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                date: today,
                time: new Date().toLocaleTimeString()
            });
            
            localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
            return { success: true, message: 'Attendance marked successfully' };
        } catch (error) {
            console.error('Error marking attendance:', error);
            return { success: false, message: 'Error marking attendance' };
        }
    }
    
    getTodaysAttendance() {
        const records = this.getAttendanceRecords();
        const today = new Date().toISOString().split('T')[0];
        return records.filter(r => r.date === today);
    }
    
    getAttendanceByDate(date) {
        const records = this.getAttendanceRecords();
        return records.filter(r => r.date === date);
    }
    
    getAttendanceByStudent(studentId) {
        const records = this.getAttendanceRecords();
        return records.filter(r => r.studentId === studentId);
    }
    
    getAttendanceByFaculty(faculty) {
        const records = this.getAttendanceRecords();
        return records.filter(r => r.faculty === faculty);
    }
    
    getAttendanceBySemester(semester) {
        const records = this.getAttendanceRecords();
        return records.filter(r => r.semester === semester);
    }
    
    // Settings Methods
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) || {};
        } catch (error) {
            console.error('Error reading settings:', error);
            return {};
        }
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            return { success: true, message: 'Settings saved successfully' };
        } catch (error) {
            console.error('Error saving settings:', error);
            return { success: false, message: 'Error saving settings' };
        }
    }
    
    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    clearAllData() {
        try {
            localStorage.removeItem(this.STORAGE_KEYS.STUDENTS);
            localStorage.removeItem(this.STORAGE_KEYS.ATTENDANCE);
            localStorage.removeItem(this.STORAGE_KEYS.SETTINGS);
            localStorage.removeItem(this.STORAGE_KEYS.DEMO_DATA_LOADED);
            this.initializeStorage();
            return { success: true, message: 'All data cleared successfully' };
        } catch (error) {
            console.error('Error clearing data:', error);
            return { success: false, message: 'Error clearing data' };
        }
    }
    
    loadDemoData() {
        try {
            const demoStudents = [
                {
                    id: 'demo1',
                    rollNumber: 'IT2023001',
                    fullName: 'John Smith',
                    email: 'john.smith@college.edu',
                    phone: '+1 (555) 123-4567',
                    faculty: 'BE IT',
                    semester: '5',
                    section: 'A',
                    academicYear: '2023-2024',
                    faceImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzQzNjFlZSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0xMDAgMTQwIEE2MCA2MCAwIDAgMCAxMDAgMjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMjAiLz48L3N2Zz4=',
                    registeredDate: '2023-01-15T10:30:00.000Z'
                },
                {
                    id: 'demo2',
                    rollNumber: 'CS2023002',
                    fullName: 'Sarah Johnson',
                    email: 'sarah.j@college.edu',
                    phone: '+1 (555) 234-5678',
                    faculty: 'BE Computer',
                    semester: '4',
                    section: 'B',
                    academicYear: '2023-2024',
                    faceImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3MjU4NSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0xMDAgMTQwIEE2MCA2MCAwIDAgMCAxMDAgMjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMjAiLz48L3N2Zz4=',
                    registeredDate: '2023-01-16T11:15:00.000Z'
                },
                {
                    id: 'demo3',
                    rollNumber: 'CE2023003',
                    fullName: 'Michael Chen',
                    email: 'michael.c@college.edu',
                    phone: '+1 (555) 345-6789',
                    faculty: 'BE Civil',
                    semester: '6',
                    section: 'C',
                    academicYear: '2023-2024',
                    faceImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzQ4YzlmMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0xMDAgMTQwIEE2MCA2MCAwIDAgMCAxMDAgMjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMjAiLz48L3N2Zz4=',
                    registeredDate: '2023-01-17T14:45:00.000Z'
                },
                {
                    id: 'demo4',
                    rollNumber: 'EE2023004',
                    fullName: 'Emma Davis',
                    email: 'emma.d@college.edu',
                    phone: '+1 (555) 456-7890',
                    faculty: 'BE Electrical',
                    semester: '3',
                    section: 'A',
                    academicYear: '2023-2024',
                    faceImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4OTYxZSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0xMDAgMTQwIEE2MCA2MCAwIDAgMCAxMDAgMjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMjAiLz48L3N2Zz4=',
                    registeredDate: '2023-01-18T09:20:00.000Z'
                },
                {
                    id: 'demo5',
                    rollNumber: 'EC2023005',
                    fullName: 'Robert Wilson',
                    email: 'robert.w@college.edu',
                    phone: '+1 (555) 567-8901',
                    faculty: 'BE Electronics',
                    semester: '7',
                    section: 'B',
                    academicYear: '2023-2024',
                    faceImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzcyMDliNyIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0xMDAgMTQwIEE2MCA2MCAwIDAgMCAxMDAgMjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMjAiLz48L3N2Zz4=',
                    registeredDate: '2023-01-19T13:10:00.000Z'
                }
            ];
            
            const demoAttendance = [
                {
                    id: 'att1',
                    studentId: 'demo1',
                    rollNumber: 'IT2023001',
                    fullName: 'John Smith',
                    faculty: 'BE IT',
                    semester: '5',
                    section: 'A',
                    status: 'present',
                    method: 'face_recognition',
                    timestamp: new Date().toISOString(),
                    date: new Date().toISOString().split('T')[0],
                    time: '09:15:24'
                },
                {
                    id: 'att2',
                    studentId: 'demo2',
                    rollNumber: 'CS2023002',
                    fullName: 'Sarah Johnson',
                    faculty: 'BE Computer',
                    semester: '4',
                    section: 'B',
                    status: 'present',
                    method: 'face_recognition',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    date: new Date().toISOString().split('T')[0],
                    time: '10:30:15'
                },
                {
                    id: 'att3',
                    studentId: 'demo3',
                    rollNumber: 'CE2023003',
                    fullName: 'Michael Chen',
                    faculty: 'BE Civil',
                    semester: '6',
                    section: 'C',
                    status: 'absent',
                    method: 'manual',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    date: new Date().toISOString().split('T')[0],
                    time: '11:45:30'
                }
            ];
            
            localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(demoStudents));
            localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify(demoAttendance));
            localStorage.setItem(this.STORAGE_KEYS.DEMO_DATA_LOADED, 'true');
            
            return { success: true, message: 'Demo data loaded successfully' };
        } catch (error) {
            console.error('Error loading demo data:', error);
            return { success: false, message: 'Error loading demo data' };
        }
    }
    
    isDemoDataLoaded() {
        return localStorage.getItem(this.STORAGE_KEYS.DEMO_DATA_LOADED) === 'true';
    }
    
    getStorageStats() {
        const students = this.getStudents();
        const attendance = this.getAttendanceRecords();
        
        let totalSize = 0;
        try {
            totalSize += JSON.stringify(students).length;
            totalSize += JSON.stringify(attendance).length;
        } catch (error) {
            totalSize = 0;
        }
        
        return {
            totalStudents: students.length,
            totalAttendance: attendance.length,
            storageUsed: Math.round(totalSize / 1024) + ' KB'
        };
    }
}

// Create global storage instance
const storage = new StorageManager();