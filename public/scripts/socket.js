const socket = io.connect("/", {
  query: {
    userId: window.userId, // You need to pass the user's ID from the server to the client
  },
});

// Listen for 'notification' events
socket.on("notification", (data) => {
  console.log("Received notification:", data);

  // Configure Toastr options
  toastr.options = {
    positionClass: "toast-bottom-right", // Position the popup at the bottom-right
    timeOut: "5000", // Display duration in milliseconds
  };

  // Display the notification using Toastr
  toastr.info(data.message);
});
