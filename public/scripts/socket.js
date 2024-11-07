// public/socket.js
const socket = io.connect("/", {
  query: {
    userId: window.userId, // You need to pass the user's ID from the server to the client
  },
});

socket.on("notification", (data) => {
  displayNotification(data.message, data.redirectUrl);
});

function displayNotification(message, redirectUrl) {
  // Use a library like Toastr or custom code to display the notification
  toastr.info(message, "New Notification", {
    onClick: () => {
      window.location.href = redirectUrl;
    },
  });
}
