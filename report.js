// js/reports.js
class ReportsManager {
    constructor() {
        this.chart = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeDateInputs();
        this.populateStudentFilter();
    }
    
    setupEventListeners() {
        // Report type change
        const reportType = document.getElementById('reportType');
        if (reportType) {
            reportType.addEventListener('change', () => this.updateReportFilters());
        }
        
        // Generate report button
        const generateBtn = document.getElementById('generateReport');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateReport());
        }
        
        // Export report button
        const exportBtn = document.getElementById('exportReportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReportCSV());
        }
    }
    
    initializeDateInputs() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('reportDate');
        if (dateInput) {
            dateInput.value = today;
            dateInput.max = today; // Can't select future dates
        }
        
        // Set default month to current month
        const monthInput = document.getElementById('reportMonth');
        if (monthInput) {
            const currentMonth = today.substring(0, 7); // YYYY-MM
            monthInput.value = currentMonth;
            monthInput.max = currentMonth;
        }
    }
    
    updateReportFilters() {
        const reportType = document.getElementById('reportType').value;
        
        // Hide all filters first
        document.getElementById('dateFilter').style.display = 'none';
        document.getElementById('monthFilter').style.display = 'none';
        document.getElementById('studentFilter').style.display = 'none';
        document.getElementById('facultyFilter').style.display = 'none';
        document.getElementById('semesterFilter').style.display = 'none';
        
        // Show relevant filters based on report type
        switch(reportType) {
            case 'daily':
                document.getElementById('dateFilter').style.display = 'block';
                break;
            case 'monthly':
                document.getElementById('monthFilter').style.display = 'block';
                break;
            case 'student':
                document.getElementById('studentFilter').style.display = 'block';
                break;
            case 'faculty':
                document.getElementById('facultyFilter').style.display = 'block';
                break;
            case 'semester':
                document.getElementById('semesterFilter').style.display = 'block';
                break;
        }
    }
    
    populateStudentFilter() {
        const select = document.getElementById('reportStudent');
        if (!select) return;
        
        const students = storage.getStudents();
        
        select.innerHTML = '<option value="">All Students</option>' + 
            students.map(student => 
                `<option value="${student.id}">${student.rollNumber} - ${student.fullName}</option>`
            ).join('');
    }
    
    generateReport() {
        const reportType = document.getElementById('reportType').value;
        
        switch(reportType) {
            case 'daily':
                this.generateDailyReport();
                break;
            case 'student':
                this.generateStudentReport();
                break;
            case 'faculty':
                this.generateFacultyReport();
                break;
            case 'semester':
                this.generateSemesterReport();
                break;
            case 'monthly':
                this.generateMonthlyReport();
                break;
        }
        
        // Enable export button
        document.getElementById('exportReportBtn').disabled = false;
    }
    
    generateDailyReport() {
        const date = document.getElementById('reportDate').value;
        const attendance = storage.getAttendanceByDate(date);
        const students = storage.getStudents();
        
        // Update report title
        document.getElementById('reportTitle').textContent = 
            `Daily Attendance Report - ${new Date(date).toLocaleDateString()}`;
        
        // Calculate statistics
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const absentCount = students.length - presentCount;
        const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;
        
        // Update statistics
        document.getElementById('reportStats').innerHTML = `
            <div class="stat-badge present">Present: ${presentCount}</div>
            <div class="stat-badge absent">Absent: ${absentCount}</div>
            <div class="stat-badge">Total: ${students.length}</div>
            <div class="stat-badge">Rate: ${attendanceRate}%</div>
        `;
        
        // Generate report table
        this.generateAttendanceTable(attendance, students);
        
        // Update chart
        this.updateChart(presentCount, absentCount);
    }
    
    generateStudentReport() {
        const studentId = document.getElementById('reportStudent').value;
        const students = storage.getStudents();
        
        if (!studentId) {
            // Generate report for all students
            this.generateAllStudentsReport();
            return;
        }
        
        // Generate report for specific student
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        
        const attendance = storage.getAttendanceByStudent(studentId);
        
        // Update report title
        document.getElementById('reportTitle').textContent = 
            `Student Attendance Report - ${student.fullName} (${student.rollNumber})`;
        
        // Calculate statistics
        const totalDays = 30; // Last 30 days for demo
        const presentCount = attendance.length;
        const absentCount = totalDays - presentCount;
        const attendanceRate = Math.round((presentCount / totalDays) * 100);
        
        // Update statistics
        document.getElementById('reportStats').innerHTML = `
            <div class="stat-badge">Present Days: ${presentCount}</div>
            <div class="stat-badge">Absent Days: ${absentCount}</div>
            <div class="stat-badge">Total Days: ${totalDays}</div>
            <div class="stat-badge">Attendance Rate: ${attendanceRate}%</div>
        `;
        
        // Generate report table
        const table = document.getElementById('reportTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Method</th>
                </tr>
            </thead>
            <tbody>
                ${attendance.map(record => `
                    <tr>
                        <td>${new Date(record.date).toLocaleDateString()}</td>
                        <td>
                            <span class="scan-status ${record.status}">
                                ${record.status === 'present' ? '✅ Present' : '❌ Absent'}
                            </span>
                        </td>
                        <td>${record.time}</td>
                        <td>${record.method === 'face_recognition' ? 'Face Recognition' : 'Manual'}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        // Update chart
        this.updateChart(presentCount, absentCount);
    }
    
    generateAllStudentsReport() {
        const students = storage.getStudents();
        
        // Update report title
        document.getElementById('reportTitle').textContent = 'Student-wise Attendance Summary';
        
        // Calculate statistics
        const totalStudents = students.length;
        
        // Update statistics
        document.getElementById('reportStats').innerHTML = `
            <div class="stat-badge">Total Students: ${totalStudents}</div>
        `;
        
        // Generate report table
        const table = document.getElementById('reportTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Faculty</th>
                    <th>Semester</th>
                    <th>Total Present</th>
                    <th>Total Absent</th>
                    <th>Attendance %</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => {
                    const attendance = storage.getAttendanceByStudent(student.id);
                    const totalDays = 30; // Demo: last 30 days
                    const presentDays = attendance.length;
                    const absentDays = totalDays - presentDays;
                    const attendanceRate = Math.round((presentDays / totalDays) * 100);
                    
                    return `
                        <tr>
                            <td>${student.rollNumber}</td>
                            <td>${student.fullName}</td>
                            <td>${student.faculty}</td>
                            <td>${student.semester}</td>
                            <td>${presentDays}</td>
                            <td>${absentDays}</td>
                            <td>
                                <div class="progress-bar" style="width: 100px; height: 10px; background-color: var(--border-color); border-radius: 5px; display: inline-block; margin-right: 10px;">
                                    <div class="progress-fill" style="width: ${attendanceRate}%; height: 100%; background-color: ${attendanceRate >= 75 ? 'var(--success-color)' : attendanceRate >= 50 ? 'var(--warning-color)' : 'var(--danger-color)'}; border-radius: 5px;"></div>
                                </div>
                                ${attendanceRate}%
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
    }
    
    generateFacultyReport() {
        const faculty = document.getElementById('reportFaculty').value;
        const students = storage.getStudents();
        const filteredStudents = faculty ? students.filter(s => s.faculty === faculty) : students;
        
        // Group by faculty
        const facultyMap = {};
        filteredStudents.forEach(student => {
            if (!facultyMap[student.faculty]) {
                facultyMap[student.faculty] = [];
            }
            facultyMap[student.faculty].push(student);
        });
        
        // Update report title
        document.getElementById('reportTitle').textContent = 
            faculty ? `${faculty} Attendance Report` : 'Faculty-wise Attendance Report';
        
        // Generate report table
        const table = document.getElementById('reportTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Faculty</th>
                    <th>Total Students</th>
                    <th>Present Today</th>
                    <th>Absent Today</th>
                    <th>Attendance Rate</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(facultyMap).map(([facultyName, facultyStudents]) => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayAttendance = storage.getAttendanceByDate(today);
                    const presentCount = todayAttendance.filter(record => 
                        record.faculty === facultyName && record.status === 'present'
                    ).length;
                    const totalCount = facultyStudents.length;
                    const absentCount = totalCount - presentCount;
                    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                    
                    return `
                        <tr>
                            <td>${facultyName}</td>
                            <td>${totalCount}</td>
                            <td>${presentCount}</td>
                            <td>${absentCount}</td>
                            <td>
                                <div class="progress-bar" style="width: 100px; height: 10px; background-color: var(--border-color); border-radius: 5px; display: inline-block; margin-right: 10px;">
                                    <div class="progress-fill" style="width: ${attendanceRate}%; height: 100%; background-color: ${attendanceRate >= 75 ? 'var(--success-color)' : attendanceRate >= 50 ? 'var(--warning-color)' : 'var(--danger-color)'}; border-radius: 5px;"></div>
                                </div>
                                ${attendanceRate}%
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
    }
    
    generateSemesterReport() {
        const semester = document.getElementById('reportSemester').value;
        const students = storage.getStudents();
        const filteredStudents = semester ? students.filter(s => s.semester === semester) : students;
        
        // Group by semester
        const semesterMap = {};
        filteredStudents.forEach(student => {
            if (!semesterMap[student.semester]) {
                semesterMap[student.semester] = [];
            }
            semesterMap[student.semester].push(student);
        });
        
        // Update report title
        document.getElementById('reportTitle').textContent = 
            semester ? `Semester ${semester} Attendance Report` : 'Semester-wise Attendance Report';
        
        // Generate report table
        const table = document.getElementById('reportTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Semester</th>
                    <th>Total Students</th>
                    <th>Present Today</th>
                    <th>Absent Today</th>
                    <th>Attendance Rate</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(semesterMap).map(([semesterNum, semesterStudents]) => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayAttendance = storage.getAttendanceByDate(today);
                    const presentCount = todayAttendance.filter(record => 
                        record.semester === semesterNum && record.status === 'present'
                    ).length;
                    const totalCount = semesterStudents.length;
                    const absentCount = totalCount - presentCount;
                    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                    
                    return `
                        <tr>
                            <td>Semester ${semesterNum}</td>
                            <td>${totalCount}</td>
                            <td>${presentCount}</td>
                            <td>${absentCount}</td>
                            <td>
                                <div class="progress-bar" style="width: 100px; height: 10px; background-color: var(--border-color); border-radius: 5px; display: inline-block; margin-right: 10px;">
                                    <div class="progress-fill" style="width: ${attendanceRate}%; height: 100%; background-color: ${attendanceRate >= 75 ? 'var(--success-color)' : attendanceRate >= 50 ? 'var(--warning-color)' : 'var(--danger-color)'}; border-radius: 5px;"></div>
                                </div>
                                ${attendanceRate}%
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
    }
    
    generateMonthlyReport() {
        const month = document.getElementById('reportMonth').value;
        const year = month.split('-')[0];
        const monthNum = month.split('-')[1];
        
        // Get all attendance for the month
        const allAttendance = storage.getAttendanceRecords();
        const monthAttendance = allAttendance.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() == year && 
                   (recordDate.getMonth() + 1) == monthNum;
        });
        
        // Update report title
        document.getElementById('reportTitle').textContent = 
            `Monthly Attendance Report - ${new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        
        // Generate daily summary
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        const dailySummary = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${monthNum.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayAttendance = monthAttendance.filter(record => record.date === date);
            const presentCount = dayAttendance.filter(record => record.status === 'present').length;
            const students = storage.getStudents();
            const totalCount = students.length;
            const absentCount = totalCount - presentCount;
            const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
            
            dailySummary.push({
                date,
                presentCount,
                absentCount,
                totalCount,
                attendanceRate
            });
        }
        
        // Update statistics
        const totalPresent = dailySummary.reduce((sum, day) => sum + day.presentCount, 0);
        const totalPossible = dailySummary.reduce((sum, day) => sum + day.totalCount, 0);
        const overallRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
        
        document.getElementById('reportStats').innerHTML = `
            <div class="stat-badge">Total Present: ${totalPresent}</div>
            <div class="stat-badge">Total Possible: ${totalPossible}</div>
            <div class="stat-badge">Overall Rate: ${overallRate}%</div>
        `;
        
        // Generate report table
        const table = document.getElementById('reportTable');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Total</th>
                    <th>Attendance Rate</th>
                </tr>
            </thead>
            <tbody>
                ${dailySummary.map(day => `
                    <tr>
                        <td>${new Date(day.date).toLocaleDateString()}</td>
                        <td>${day.presentCount}</td>
                        <td>${day.absentCount}</td>
                        <td>${day.totalCount}</td>
                        <td>
                            <div class="progress-bar" style="width: 100px; height: 10px; background-color: var(--border-color); border-radius: 5px; display: inline-block; margin-right: 10px;">
                                <div class="progress-fill" style="width: ${day.attendanceRate}%; height: 100%; background-color: ${day.attendanceRate >= 75 ? 'var(--success-color)' : day.attendanceRate >= 50 ? 'var(--warning-color)' : 'var(--danger-color)'}; border-radius: 5px;"></div>
                            </div>
                            ${day.attendanceRate}%
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    }
    
    generateAttendanceTable(attendance, allStudents) {
        const table = document.getElementById('reportTable');
        
        if (attendance.length === 0) {
            document.getElementById('noReportData').style.display = 'block';
            table.style.display = 'none';
            return;
        }
        
        document.getElementById('noReportData').style.display = 'none';
        table.style.display = 'table';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Faculty</th>
                    <th>Semester</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Method</th>
                </tr>
            </thead>
            <tbody>
                ${attendance.map(record => `
                    <tr>
                        <td>${record.rollNumber}</td>
                        <td>${record.fullName}</td>
                        <td>${record.faculty}</td>
                        <td>${record.semester}</td>
                        <td>${record.time}</td>
                        <td>
                            <span class="scan-status ${record.status}">
                                ${record.status === 'present' ? '✅ Present' : '❌ Absent'}
                            </span>
                        </td>
                        <td>${record.method === 'face_recognition' ? 'Face Recognition' : 'Manual'}</td>
                    </tr>
                `).join('')}
                
                ${allStudents
                    .filter(student => !attendance.some(record => record.studentId === student.id))
                    .map(student => `
                        <tr>
                            <td>${student.rollNumber}</td>
                            <td>${student.fullName}</td>
                            <td>${student.faculty}</td>
                            <td>${student.semester}</td>
                            <td>-</td>
                            <td>
                                <span class="scan-status absent">
                                    ❌ Absent
                                </span>
                            </td>
                            <td>-</td>
                        </tr>
                    `).join('')}
            </tbody>
        `;
    }
    
    updateChart(presentCount, absentCount) {
        const canvas = document.getElementById('attendanceChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy previous chart if exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent'],
                datasets: [{
                    data: [presentCount, absentCount],
                    backgroundColor: [
                        'var(--success-color)',
                        'var(--danger-color)'
                    ],
                    borderColor: [
                        'var(--success-dark)',
                        'var(--danger-color)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-color)',
                            padding: 20,
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.raw;
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    exportReportCSV() {
        const table = document.getElementById('reportTable');
        if (!table || table.style.display === 'none') {
            if (window.mainApp) {
                window.mainApp.showNotification('No report data to export', 'error');
            }
            return;
        }
        
        // Extract data from table
        const rows = [];
        const headers = [];
        
        // Get headers
        table.querySelectorAll('thead th').forEach(th => {
            headers.push(th.textContent.trim());
        });
        
        // Get rows
        table.querySelectorAll('tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
                // Remove any HTML from cell content
                const text = td.textContent.trim().replace(/✅|❌|⚠️/g, '').trim();
                row.push(text);
            });
            rows.push(row);
        });
        
        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        // Create download link
        const reportType = document.getElementById('reportType').value;
        const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (window.mainApp) {
            window.mainApp.showNotification('Report exported successfully', 'success');
        }
    }
}

// Initialize reports manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
});