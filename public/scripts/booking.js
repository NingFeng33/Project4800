document.addEventListener('DOMContentLoaded', function() {
    loadPrograms();
    // document.getElementById('bookingForm').addEventListener('submit', function(event) {
    //     event.preventDefault();
    // });

    document.getElementById('programSelector').addEventListener('change', function() {
        const programId = this.value;
        loadCourses(programId);
    });
    document.getElementById('checkAvailabilityButton').addEventListener('click', function() {
        checkAvailability();  
    });
});

async function loadPrograms() {
    const programSelector = document.getElementById('programSelector');
    try {
        const response = await fetch('/api/programs');
        const programs = await response.json();
        programs.forEach(program => {
            const option = document.createElement('option');
            option.value = program.program_id;
            option.textContent = program.program_name;
            programSelector.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading programs:', error);
    }
}

async function loadCourses(programId) {
    const courseSelector = document.getElementById('courseSelector');
    //console.log('Loading courses for program:', programId);
    courseSelector.innerHTML = '<option value="">Select a Course</option>'; // Reset dropdown
    if (!programId) return;  // Exit if no programId is selected

    try {
        const response = await fetch(`/api/courses/${programId}`);
        const courses = await response.json();
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_id;
            option.textContent = course.course_name;
            courseSelector.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

async function checkAvailability() {
    const programId = document.getElementById('programSelector').value;
    const courseId = document.getElementById('courseSelector').value;
    const date = document.getElementById('dateInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;
    console.log('Checking availability:', programId, courseId, date, startTime, endTime);
    if (!programId || !courseId || !date || !startTime || !endTime) {
        alert('Please fill all fields!');
        return;
    }

    try {
        const response = await fetch('/admin/booking/check-availability', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ date, startTime, endTime, courseId })
        });

        const result = await response.json();
        console.log('Availability result:', result);
        if (result.success) {
            displayAvailableRooms(result.availableRooms);
        } else {
            console.error('Failed to fetch available rooms:', result.message);
            alert('Failed to fetch available rooms');
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        alert('Error checking availability');
    }
}

function displayAvailableRooms(rooms) {
    const roomsList = document.getElementById('availableRooms');
    roomsList.innerHTML = ''; // Clear previous entries

    if (rooms.length === 0) {
        roomsList.innerHTML = '<p>No available rooms found for the selected times.</p>';
        return;
    }

    const list = document.createElement('ul');
    rooms.forEach(room => {
        const roomElement = document.createElement('li');
        roomElement.textContent = `Room Number: ${room.room_number}, Capacity: ${room.capacity}`;
        
        // Create a radio button for each room to allow selection
        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'selectedRoom';
        radioButton.value = room.room_id;

        // Append radio button and room details to the list item
        roomElement.appendChild(radioButton);
        list.appendChild(roomElement);
    });
    roomsList.appendChild(list);

    // Optionally, add a submit button if not already part of the form
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Book Selected Room';
    submitButton.type = 'button'; // Change this to 'submit' if part of a form
    submitButton.onclick = function() {
        // Function to handle booking the selected room
        bookRoom();
    };
    roomsList.appendChild(submitButton);
}

function bookRoom() {
    const selectedRoomId = document.querySelector('input[name="selectedRoom"]:checked').value;
    const date = document.getElementById('dateInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;
    const courseId = document.getElementById('courseSelector').value;
    if (!selectedRoomId) {
        alert('Please select a room to book.');
        return;
    }

    // Send the booking request to the server
    fetch('/admin/booking/book-room', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            roomId: selectedRoomId,
            date: date,
            startTime: startTime,
            endTime: endTime,
            courseId: courseId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Room booked successfully!');
            // Optionally refresh the page or clear the form
        } else {
            alert('Failed to book the room: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Error booking the room:', error);
        alert('Error booking the room');
    });
}