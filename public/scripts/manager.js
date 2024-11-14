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
                <button onclick="openEditModal('course', ${course.course_id}, '${course.course_code}', 
                '${course.course_name}', '${course.Program ? course.Program.program_name : ''}')">Edit</button>
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
                <button onclick="openEditModal('room', ${room.room_id}, '${room.room_number}', 
                ${room.capacity})">Edit</button>
                <button onclick="deleteRoom(${room.room_id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openEditModal(type, id, codeOrNumber, nameOrCapacity, programName = '') {
    const modal = document.getElementById('edit-modal');
    const editForm = document.getElementById('editForm');
    
    // Set form action based on type (course or room)
    editForm.action = `/${type}s/${id}/edit`; 

    // Set the values for editing
    if (type === 'course') {
        document.getElementById('editCodeOrNumberLabel').textContent = 'Course Code';
        document.getElementById('editNameOrCapacityLabel').textContent = 'Course Name';
        document.getElementById('editProgram').style.display = 'block';
        document.getElementById('editProgramInput').value = programName;
    } else {
        document.getElementById('editCodeOrNumberLabel').textContent = 'Room Number';
        document.getElementById('editNameOrCapacityLabel').textContent = 'Capacity';
        document.getElementById('editProgram').style.display = 'none';
    }

    // Fill input values
    document.getElementById('editId').value = id;
    document.getElementById('editCodeOrNumberInput').value = codeOrNumber;
    document.getElementById('editNameOrCapacityInput').value = nameOrCapacity;

    modal.style.display = 'block';
}

// Close modal function
function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
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

document.addEventListener("DOMContentLoaded", function() {
    function openModal() {
        const modal = document.getElementById("edit-modal");
        const backdrop = document.getElementById("modal-backdrop");

        if (modal && backdrop) {
            modal.style.display = "block";
            backdrop.style.display = "block";
        } else {
            console.error("Modal or backdrop element not found.");
        }
    }

    function closeModal() {
        const modal = document.getElementById("edit-modal");
        const backdrop = document.getElementById("modal-backdrop");

        if (modal && backdrop) {
            modal.style.display = "none";
            backdrop.style.display = "none";
        } else {
            console.error("Modal or backdrop element not found.");
        }
    }

    window.openModal = openModal;
    window.closeModal = closeModal;
});


function openEditModal(type, id, codeOrNumber, nameOrCapacity, program) {
    const modal = document.getElementById("edit-modal");
    const backdrop = document.getElementById("modal-backdrop");
    
    document.getElementById("editType").textContent = type === 'course' ? 'Course' : 'Room';
    document.getElementById("editId").value = id;
    document.getElementById("editCodeOrNumberInput").value = codeOrNumber;
    document.getElementById("editNameOrCapacityInput").value = nameOrCapacity;

    // Show or hide the program field based on type
    const programField = document.getElementById("editProgram");
    if (type === 'course') {
        programField.style.display = 'block';
        document.getElementById("editProgramInput").value = program || '';
    } else {
        programField.style.display = 'none';
    }

    // Set the form action dynamically based on type
    const editForm = document.getElementById("editForm");
    editForm.action = `/${type}s/${id}/edit`;

    // Show modal and backdrop
    modal.style.display = "block";
    backdrop.style.display = "block";
}

function closeModal() {
    document.getElementById("edit-modal").style.display = "none";
    document.getElementById("modal-backdrop").style.display = "none";
}
