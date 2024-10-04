async function loadPrograms() {
    const response = await fetch('/api/programs');
    const programs = await response.json();
    const programSelector = document.getElementById('programSelector');
    programs.forEach(program => {
        const option = document.createElement('option');
        option.value = program.id;
        option.textContent = program.name;
        programSelector.appendChild(option);
    });
}

document.getElementById('programSelector').addEventListener('change', async function() {
    const programId = this.value;
    const response = await fetch(`/api/courses/${programId}`);
    const courses = await response.json();
    const courseSelector = document.getElementById('courseSelector');
    courseSelector.innerHTML = '';
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseSelector.appendChild(option);
    });
});

async function checkAvailability() {
    const date = document.getElementById('dateInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;
    const response = await fetch('/api/rooms/availability', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({date, startTime, endTime})
    });
    const availableRooms = await response.json();
    const availableRoomsDiv = document.getElementById('availableRooms');
    availableRoomsDiv.innerHTML = '';
    availableRooms.forEach(room => {
        const div = document.createElement('div');
        div.textContent = `Room ${room.room_number} with capacity ${room.capacity} is available`;
        availableRoomsDiv.appendChild(div);
    });
}

loadPrograms();
