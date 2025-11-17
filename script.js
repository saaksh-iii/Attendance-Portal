// Data structure for storing attendance
let students = [];
let attendanceRecords = [];
let currentDate = new Date().toISOString().split('T')[0];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDate();
    loadAttendance();
    updateUI();
    
    // Show auto-save notification
    console.log('✓ Auto-save is enabled. Your data will be saved automatically.');
});

// Initialize date picker with today's date
function initializeDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('classDate').value = today;
    currentDate = today;
    updateDateDisplay();
}

// Update date display
function updateDateDisplay() {
    const dateObj = new Date(currentDate + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = formattedDate;
}

// Change the date
function changeDate() {
    const newDate = document.getElementById('classDate').value;
    if (newDate) {
        currentDate = newDate;
        updateDateDisplay();
        updateUI();
    } else {
        alert('Please select a date');
    }
}

// Add a new student
function addStudent() {
    const nameInput = document.getElementById('studentName');
    const rollInput = document.getElementById('rollNumber');
    const name = nameInput.value.trim();
    const rollNo = rollInput.value.trim();

    if (name === '') {
        alert('Please enter a student name');
        return;
    }

    if (rollNo === '') {
        alert('Please enter a roll number');
        return;
    }

    // Check if student already exists by name or roll number
    if (students.some(student => student.name.toLowerCase() === name.toLowerCase())) {
        alert('This student name already exists');
        nameInput.value = '';
        rollInput.value = '';
        return;
    }

    if (students.some(student => student.rollNo.toLowerCase() === rollNo.toLowerCase())) {
        alert('This roll number already exists');
        nameInput.value = '';
        rollInput.value = '';
        return;
    }

    const student = {
        id: Date.now(),
        name: name,
        rollNo: rollNo,
        attendance: {}
    };

    students.push(student);
    nameInput.value = '';
    rollInput.value = '';
    updateUI();
    saveAttendance();
}

// Mark attendance for a student
function markAttendance(studentId, status) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        if (!student.attendance) {
            student.attendance = {};
        }
        student.attendance[currentDate] = status;
        updateUI();
        saveAttendance();
    }
}

// Mark all students as present
function markAllPresent() {
    if (students.length === 0) {
        alert('No students to mark');
        return;
    }
    students.forEach(student => {
        if (!student.attendance) {
            student.attendance = {};
        }
        student.attendance[currentDate] = 'present';
    });
    updateUI();
    saveAttendance();
}

// Mark all students as absent
function markAllAbsent() {
    if (students.length === 0) {
        alert('No students to mark');
        return;
    }
    students.forEach(student => {
        if (!student.attendance) {
            student.attendance = {};
        }
        student.attendance[currentDate] = 'absent';
    });
    updateUI();
    saveAttendance();
}

// Clear attendance for current date
function clearAttendance() {
    if (students.length === 0) return;

    if (confirm('Clear attendance for ' + formatDate(currentDate) + '?')) {
        students.forEach(student => {
            if (student.attendance) {
                delete student.attendance[currentDate];
            }
        });
        updateUI();
        saveAttendance();
    }
}

// Remove a student
function removeStudent(studentId) {
    if (confirm('Are you sure you want to remove this student?')) {
        students = students.filter(s => s.id !== studentId);
        updateUI();
        saveAttendance();
    }
}

// Update the UI
function updateUI() {
    renderStudents();
    updateStatistics();
    updateHistory();
}

// Render students
function renderStudents() {
    const attendanceList = document.getElementById('attendanceList');

    if (students.length === 0) {
        attendanceList.innerHTML = '<p class="empty-message">No students added yet. Add a student above to get started.</p>';
        return;
    }

    attendanceList.innerHTML = students.map(student => {
        const status = student.attendance && student.attendance[currentDate];
        const statusText = status ? (status === 'present' ? '✓ Present' : '✗ Absent') : 'Not Marked';
        const statusColor = status ? (status === 'present' ? '#6dd5a8' : '#f78c8c') : '#999';

        return `
            <div class="student-item">
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-roll">Roll No: ${student.rollNo}</div>
                    <div class="student-status" style="color: ${statusColor}; font-weight: 600;">${statusText}</div>
                </div>
                <div class="attendance-buttons">
                    <button onclick="markAttendance(${student.id}, 'present')" class="btn btn-small btn-present">Present</button>
                    <button onclick="markAttendance(${student.id}, 'absent')" class="btn btn-small btn-absent">Absent</button>
                    <button onclick="removeStudent(${student.id})" class="btn btn-small btn-remove">Remove</button>
                </div>
            </div>
        `;
    }).join('');
}

// Update statistics
function updateStatistics() {
    const total = students.length;
    const present = students.filter(s => s.attendance && s.attendance[currentDate] === 'present').length;
    const absent = students.filter(s => s.attendance && s.attendance[currentDate] === 'absent').length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    document.getElementById('totalStudents').textContent = total;
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
    document.getElementById('attendancePercentage').textContent = percentage + '%';
}

// Update attendance history
function updateHistory() {
    const historyList = document.getElementById('historyList');
    
    // Get all unique dates with attendance records
    const dates = new Set();
    students.forEach(student => {
        if (student.attendance) {
            Object.keys(student.attendance).forEach(date => dates.add(date));
        }
    });

    if (dates.size === 0) {
        historyList.innerHTML = '<p class="empty-message">No attendance records yet.</p>';
        return;
    }

    const sortedDates = Array.from(dates).sort().reverse();

    historyList.innerHTML = sortedDates.map(date => {
        const present = students.filter(s => s.attendance && s.attendance[date] === 'present').length;
        const absent = students.filter(s => s.attendance && s.attendance[date] === 'absent').length;
        const percentage = students.length === 0 ? 0 : Math.round((present / students.length) * 100);

        return `
            <div class="history-item">
                <div class="history-date">${formatDate(date)}</div>
                <div class="history-details">
                    <strong>Present:</strong> ${present} | 
                    <strong>Absent:</strong> ${absent} | 
                    <strong>Attendance:</strong> ${percentage}%
                </div>
            </div>
        `;
    }).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Save attendance to localStorage
function saveAttendance() {
    const data = {
        students: students,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('attendanceData', JSON.stringify(data));
}

// Load attendance from localStorage
function loadAttendance() {
    const saved = localStorage.getItem('attendanceData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            students = data.students || [];
        } catch (e) {
            console.error('Error loading data:', e);
            students = [];
        }
    }
}

// Export to CSV
function exportToCSV() {
    if (students.length === 0) {
        alert('No data to export');
        return;
    }

    // Get all unique dates
    const dates = new Set();
    students.forEach(student => {
        if (student.attendance) {
            Object.keys(student.attendance).forEach(date => dates.add(date));
        }
    });

    const sortedDates = Array.from(dates).sort();

    // Create CSV content
    let csv = 'Student Name,Roll No,' + sortedDates.map(date => formatDate(date)).join(',') + '\n';

    students.forEach(student => {
        const row = [student.name, student.rollNo];
        sortedDates.forEach(date => {
            const status = student.attendance && student.attendance[date];
            row.push(status === 'present' ? 'P' : status === 'absent' ? 'A' : '-');
        });
        csv += row.join(',') + '\n';
    });

    // Add summary
    csv += '\n\nDaily Summary\n';
    csv += 'Date,Total Students,Present,Absent,Percentage\n';
    sortedDates.forEach(date => {
        const total = students.length;
        const present = students.filter(s => s.attendance && s.attendance[date] === 'present').length;
        const absent = students.filter(s => s.attendance && s.attendance[date] === 'absent').length;
        const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
        csv += `${formatDate(date)},${total},${present},${absent},${percentage}%\n`;
    });

    // Download CSV
    downloadFile(csv, 'attendance_report.csv');
}

// Download file helper
function downloadFile(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Reset all data
function resetAll() {
    if (confirm('Are you sure? This will delete all data permanently!')) {
        students = [];
        attendanceRecords = [];
        localStorage.removeItem('attendanceData');
        updateUI();
        alert('All data has been reset');
    }
}

// Allow Enter key to add student
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && document.activeElement.id === 'studentName') {
        addStudent();
    }
});
