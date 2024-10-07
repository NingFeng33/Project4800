document.addEventListener('DOMContentLoaded', function() {
    loadPrograms();
    document.getElementById('bookingForm').addEventListener('submit', function(event) {
        event.preventDefault();
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

async function checkAvailability() {
    const programId = document.getElementById('programSelector').value;
    const courseId = document.getElementById('courseSelector').value;
    const date = document.getElementById('dateInput').value;
    const time = document.getElementById('timeInput').value;

    try {
        const response = await fetch('/booking/check-availability', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ programId, courseId, date, time })
        });

        const result = await response.json();
        if(result.success) {
            displayAvailableRooms(result.availableRooms);
        } else {
            console.error('Failed to fetch available rooms:', result.message);
        }
    } catch (error) {
        console.error('Error checking availability:', error);
    }
}

function displayAvailableRooms(rooms) {
    const roomsList = document.getElementById('availableRooms');
    roomsList.innerHTML = ''; // Clear previous entries
    rooms.forEach(room => {
        const roomElement = document.createElement('div');
        roomElement.textContent = `Room ${room.room_number} is available`;
        roomsList.appendChild(roomElement);
    });
}