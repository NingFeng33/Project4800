async function filterAndSearch() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const selectedProgram = document.getElementById('program-filter').value;

    const rows = document.querySelectorAll('#course-table-body tr');

    rows.forEach(row => {
        const courseCode = row.querySelector('td:nth-child(1)').innerText.toLowerCase();
        const courseName = row.querySelector('td:nth-child(2)').innerText.toLowerCase();
        const programName = row.querySelector('td:nth-child(3)').innerText;

        const matchesSearch = courseCode.includes(searchQuery) || courseName.includes(searchQuery);
        const matchesProgram = selectedProgram === "" || programName === selectedProgram;

        if (matchesSearch && matchesProgram) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

window.onload = () => {
    filterAndSearch();
};

const rowsPerPage = 5; // Rows per page

// Fetch courses with pagination
async function fetchCourses(page = 1) {
    const response = await fetch(`/courses?page=${page}&limit=${rowsPerPage}`);
    const { courses, totalPages, currentPage } = await response.json();
    displayCourses(courses);
    updatePagination('course-pagination', currentPage, totalPages, fetchCourses);
}

// Fetch rooms with pagination
async function fetchRooms(page = 1) {
    const response = await fetch(`/rooms?page=${page}&limit=${rowsPerPage}`);
    const { rooms, totalPages, currentPage } = await response.json();
    displayRooms(rooms);
    updatePagination('room-pagination', currentPage, totalPages, fetchRooms);
}

// Display courses in the table
function displayCourses(courses) {
    const tableBody = document.getElementById('course-table-body');
    tableBody.innerHTML = ''; // Clear previous rows
    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.course_code}</td>
            <td>${course.course_name}</td>
            <td>${course.Program ? course.Program.program_name : 'N/A'}</td>
            <td>
                <button onclick="deleteCourse(${course.course_id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Display rooms in the table
function displayRooms(rooms) {
    const tableBody = document.getElementById('room-table-body');
    tableBody.innerHTML = ''; // Clear previous rows
    rooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.room_number}</td>
            <td>${room.capacity}</td>
            <td>
                <button onclick="deleteRoom(${room.room_id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update pagination controls
function updatePagination(containerId, currentPage, totalPages, fetchFunction) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous pagination

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => fetchFunction(currentPage - 1);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => fetchFunction(currentPage + 1);

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    container.appendChild(prevButton);
    container.appendChild(pageInfo);
    container.appendChild(nextButton);
}

// Fetch the first page of courses and rooms on page load
window.onload = () => {
    fetchCourses();
    fetchRooms();
};

// Delete course by ID using AJAX
async function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        try {
            const response = await fetch(`/courses/${courseId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Course deleted successfully.');
                window.location.reload(); 
            } else {
                alert('Failed to delete course.');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('An error occurred. Please try again.');
        }
    }
}

// Delete room by ID using AJAX
async function deleteRoom(roomId) {
    if (confirm('Are you sure you want to delete this room?')) {
        try {
            const response = await fetch(`/rooms/${roomId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Room deleted successfully.');
                window.location.reload(); 
            } else {
                alert('Failed to delete room.');
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('An error occurred. Please try again.');
        }
    }
}

