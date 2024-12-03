let currentPage = 1;
let allCourses = [];
let currentRoomPage = 1; 
let allRooms = [];

const rowsPerPage = 5; // Rows per page
const roomsPerPage = 5; 


async function fetchAllCourses() {
    try {
        const response = await fetch('/courses?limit=1000'); // Fetch all courses without pagination
        const data = await response.json();
        allCourses = data.courses || []; // Assign fetched courses
    } catch (error) {
        console.error("Error fetching all courses:", error);
    }
}

function filterAndSearchWithPagination(resetPage = true) {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const selectedProgram = document.getElementById('program-filter').value;

    // Filter courses based on search query and selected program
    const filteredCourses = allCourses.filter(course => {
        const matchesSearch =
            course.course_code.toLowerCase().includes(searchQuery) ||
            course.course_name.toLowerCase().includes(searchQuery);

        const matchesProgram =
            selectedProgram === "" || course.Program?.program_name === selectedProgram;

        return matchesSearch && matchesProgram;
    });

    if (resetPage) {
        currentPage = 1;
    }

    // Calculate total pages
    const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);

    // Display the first page of filtered courses
    displayCourses(paginateCourses(filteredCourses, currentPage));
    updatePagination('course-pagination', currentPage, totalPages, page => {
        currentPage = page;
        filterAndSearchWithPagination(false);
        displayCourses(paginateCourses(filteredCourses, page));
    });
}


function paginateCourses(courses, page = 1) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return courses.slice(start, end); // Return only the courses for the current page
}

// Update pagination controls
function updatePagination(containerId, currentPage, totalPages, fetchFunction, filterCriteria = null) {
    console.log(`Updating pagination: currentPage=${currentPage}, totalPages=${totalPages}`);
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Pagination container with id "${containerId}" not found.`);
        return;
    }

    container.innerHTML = ''; // Clear previous pagination controls

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage <= 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--; // Decrement the page
            console.log(`Previous button clicked: currentPage=${currentPage}`);
            fetchFunction(currentPage, filterCriteria); // Fetch previous page
        } 
    };

    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage >= totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++; // Increment the page
            console.log(`Next button clicked: currentPage=${currentPage}`);
            fetchFunction(currentPage, filterCriteria); // Fetch next page
        }
    };

    container.appendChild(prevButton);
    container.appendChild(pageInfo);
    container.appendChild(nextButton);
}

// Fetch courses with pagination
async function fetchCourses(page = 1, filterCriteria = {}) {
    const params = new URLSearchParams({
        page,
        limit: rowsPerPage,
        search: filterCriteria.searchQuery || '',
        program: filterCriteria.selectedProgram || '',
    });

    try {
        const response = await fetch(`/courses?${params}`);
        const { courses, totalPages } = await response.json();

        currentPage = page;

        displayCourses(courses);
        updatePagination('course-pagination', currentPage, totalPages, fetchCourses, filterCriteria);
    } catch (error) {
        console.error("Error fetching courses:", error);
    }
    
}

// Fetch rooms with pagination
async function fetchRooms(page = 1) {
    const params = new URLSearchParams({
        page,
        limit: rowsPerPage
    });

    try {
        const response = await fetch(`/rooms?${params}`);
        const { rooms, totalPages } = await response.json();

        // Update the current page for rooms
        roomCurrentPage = page;

        // Display the fetched rooms
        displayRooms(rooms);

        // Update room pagination controls
        updatePagination('room-pagination', roomCurrentPage, totalPages, fetchRooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
    }
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
                <button class="edit" onclick="openEditModal('course', '${course.course_id}', '${course.course_code}', 
                '${course.course_name}', '${course.Program ? course.Program.program_name : ''}')">Edit</button>
                <form action="/admin/courses/${course.course_id}/delete" method="POST" style="display:inline;"
                    onsubmit="return confirmDelete('course')">
                    <button class="delete" type="submit">Delete</button>
                </form>
            </td>  
        `;
        tableBody.appendChild(row);
    });
}

document.getElementById('program-filter').addEventListener('change', () => {
    filterAndSearchWithPagination(true); // Reset page when filter changes
});

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
                <button class="edit" onclick="openEditModal('room', '${room.room_id}',
                 '${room.room_number}', '${room.capacity}')">Edit</button>
                <form action="/admin/rooms/${room.room_id}/delete" method="POST" style="display:inline;"
                    onsubmit="return confirmDelete('room')">
                    <button class="delete" type="submit">Delete</button>
                </form>

            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Paginate rooms based on current page
function paginateRooms(rooms, page = 1) {
    const start = (page - 1) * roomsPerPage;
    const end = start + roomsPerPage;
    return rooms.slice(start, end); // Return only the rooms for the current page
}

// Fetch all rooms without pagination
async function fetchAllRooms() {
    try {
        const response = await fetch('/rooms?limit=1000'); // Fetch all rooms
        const data = await response.json();
        allRooms = data.rooms || []; // Store fetched rooms globally
        updateRoomPagination(); // Initialize pagination controls
    } catch (error) {
        console.error("Error fetching all rooms:", error);
    }
}

// Update room pagination controls
function updateRoomPagination() {
    const totalPages = Math.ceil(allRooms.length / roomsPerPage); // Calculate total pages
    displayRooms(paginateRooms(allRooms, currentRoomPage)); // Display current page of rooms

    updatePagination('room-pagination', currentRoomPage, totalPages, page => {
        currentRoomPage = page; // Update current page
        displayRooms(paginateRooms(allRooms, page)); // Display rooms for the new page
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
function closeProgramModal() {
    document.getElementById('edit-modal').style.display = 'none';
}


// Fetch the first page of courses and rooms on page load
window.onload = async () => {
    await fetchAllCourses(); // Populate allCourses
    filterAndSearchWithPagination(); // Filter and display initial data
    await fetchAllRooms(); // Fetch all rooms and store them globally
    updateRoomPagination();
    fetchCourses();
    fetchRooms();
};

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

document.getElementById("editForm").onsubmit = async function (event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const id = formData.get("id");
    const type = document.getElementById("editType").textContent.toLowerCase();
    const url = `/admin/${type}s/${id}/edit`;

    const data = {
        codeOrNumber: formData.get("codeOrNumber"),
        nameOrCapacity: formData.get("nameOrCapacity"),
        program: type === 'course' ? formData.get("program") : undefined
    };

    // Client-side debug logs
    console.log("Submitting edit form");
    console.log("ID:", id);
    console.log("Type:", type);
    console.log("URL:", url);
    console.log("Data to send:", data);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
            closeModal();
            window.location.reload(); // Reload the page to show updated data
        } else {
            console.error(`Failed to update ${type}. Status: ${response.status}`);
            alert(`Failed to update ${type}`);
        }
    } catch (error) {
        console.error('Error updating:', error);
        alert('An error occurred. Please try again.');
    }
};

function confirmDelete(itemType) {
    return confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`);
}

document.addEventListener("DOMContentLoaded", function() {
    function toVancouverTime(utcDateStr) {
        const date = new Date(utcDateStr);
        return date.toLocaleString('en-US', { 
            timeZone: 'America/Vancouver', 
            hour: 'numeric', 
            minute: 'numeric', 
            hour12: true 
        });
    }

    document.querySelectorAll(".schedule-time").forEach(el => {
        const utcTime = el.dataset.utc; 
        el.textContent = toVancouverTime(utcTime); 
    });
});

// Open the "Edit Program" Modal
function openEditProgramModal(programId, programName) {
    const modal = document.getElementById('editProgramModal');
    const form = document.getElementById('editProgramForm');
    
    // Set the program ID and name in the form fields
    document.getElementById('editProgramId').value = programId;
    document.getElementById('editProgramName').value = programName;
    
    // Set the form action dynamically
    form.action = `/admin/programs/${programId}/edit`;

    // Display the modal
    modal.style.display = 'block';
}

function closeProgramModal() {
    document.getElementById('editProgramModal').style.display = 'none';
}

