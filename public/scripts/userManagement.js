function openEditModal(userId, firstName, lastName, email, role) {
    document.getElementById("editUserModal").style.display = "block";
    document.getElementById("editUserId").value = userId;
    document.getElementById("editFirstName").value = firstName;
    document.getElementById("editLastName").value = lastName;
    document.getElementById("editEmail").value = email;
    document.getElementById("editRole").value = role;
}

// Close the modal function
function closeEditModal() {
    document.getElementById("editUserModal").style.display = "none";
}



function confirmDelete() {
    return confirm("Are you sure you want to delete this user?");
}

// Make the modal draggable
const modal = document.getElementById("editUserModal");
const header = document.querySelector(".modal-header");

let offsetX, offsetY;

header.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - modal.getBoundingClientRect().left;
    offsetY = e.clientY - modal.getBoundingClientRect().top;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
});

function onMouseMove(e) {
    modal.style.position = "absolute";
    modal.style.left = `${e.clientX - offsetX}px`;
    modal.style.top = `${e.clientY - offsetY}px`;
}

function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
}
