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
    const endDate = document.getElementById('endDateInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;
    console.log('Checking availability:', programId, courseId, date, endDate, startTime, endTime);

    if (!programId || !courseId || !date || !endDate || !startTime || !endTime) {
        alert('Please fill all fields!');
        return;
    }

    try {
        const response = await fetch('/admin/booking/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, endDate, startTime, endTime, courseId })
        });

        // 응답 상태 확인
        if (!response.ok) { // 응답이 성공적이지 않을 경우
            const errorText = await response.text(); // 에러 내용을 텍스트로 확인
            console.error('Failed to check availability:', errorText); // 에러 메시지 출력
            alert('Server error: ' + errorText);
            return; // 함수 종료
        }

        const result = await response.json(); // 응답을 JSON으로 변환
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
    const roomsTableBody = document.getElementById('availableRooms').getElementsByTagName('tbody')[0];
    roomsTableBody.innerHTML = ''; // Clear previous entries

    if (rooms.length === 0) {
        roomsTableBody.innerHTML = '<tr><td colspan="3">No available rooms found for the selected times.</td></tr>';
        return;
    }

    rooms.forEach(room => {
        const row = document.createElement('tr');
        const roomNumberCell = document.createElement('td');
        roomNumberCell.textContent = room.room_number;

        const capacityCell = document.createElement('td');
        capacityCell.textContent = room.capacity;

        const selectCell = document.createElement('td');
        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'selectedRoom';
        radioButton.value = room.room_id;

        selectCell.appendChild(radioButton);
        
        // Append cells to the row
        row.appendChild(roomNumberCell);
        row.appendChild(capacityCell);
        row.appendChild(selectCell);
        
        // Append row to the table body
        roomsTableBody.appendChild(row);
    });

    // Optionally, add a submit button if not already part of the form
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Book Selected Room';
    submitButton.type = 'button';
    submitButton.onclick = function() {
        bookRoom(); // Ensure this function fetches the selected radio button value
    };

    // Append the submit button after the table but within the same container
    const container = roomsTableBody.parentElement; // The table's parent element
    container.appendChild(submitButton);
}

function bookRoom() {
    const selectedRoom = document.querySelector('input[name="selectedRoom"]:checked');
    if (!selectedRoom) {
        alert('Please select a room to book.');
        return;
    }
    const selectedRoomId = selectedRoom.value;

    // Gather other form data
    const date = document.getElementById('dateInput').value;
    const endDate = document.getElementById('endDateInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;
    const courseId = document.getElementById('courseSelector').value;

    // Send the booking request to the server
    fetch('/admin/booking/book-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            roomId: selectedRoomId,
            date: date,
            endDate: endDate,
            startTime: startTime,
            endTime: endTime,
            courseId: courseId
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result); // 서버로부터 받은 결과를 확인합니다.
        if (result.success) {
            alert('Room booked successfully!');
            document.getElementById('availableRooms').style.display = 'none'; // Clear the list after booking

            // 방어 코드: room 객체와 room_number 확인
            const roomNumber = result.room && result.room.room_number ? result.room.room_number : 'Unknown Room';

            // Convert to ISO format for FullCalendar
            const start = new Date(`${date}T${startTime}`).toISOString();
            const end = new Date(`${endDate}T${endTime}`).toISOString();
            
            console.log("Adding event to calendar:", {
                title: `Booked: ${roomNumber}`,
                start: start,
                end: end
            });

            // 캘린더가 초기화될 때까지 대기
            const waitForCalendar = setInterval(() => {
                if (window.calendar && typeof window.calendar.addEvent === 'function') {
                    // Add the new booking directly to the calendar
                    window.calendar.addEvent({
                        title: `Booked: ${roomNumber}`,
                        start: start,
                        end: end,
                        extendedProps: {
                            roomId: selectedRoomId,
                            courseId: courseId
                        }
                    });
                    clearInterval(waitForCalendar); // 대기 중지
                    
                    // 캘린더 다시 렌더링 및 이벤트 새로 고침
                    window.calendar.render();
                    window.calendar.refetchEvents();
                }
            }, 100); // 100ms마다 확인
            document.getElementById('bookingForm').reset(); // Reset the form
        } else {
            alert('Failed to book the room: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Error booking the room:', error);
        alert('Error booking the room');
    });
}
