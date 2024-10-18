
document.addEventListener("DOMContentLoaded", function () {
  const confirmNewPassBtn = document.getElementById("new-password-button");

  confirmNewPassBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("new-password").value.trim();
    const newPasswordConfirm = document
      .getElementById("new-password-confirm")
      .value.trim();
    const response = document.getElementById("response");

    if (newPassword === newPasswordConfirm) {
      try {
        await updateUserPassword({ password: newPassword });
      } catch (e) {
        response.innerText = "Failed to update password. Try again.";
      }
    } else {
      response.innerText = "Passwords do not match. Try again.";
    }
  });

  async function updateUserPassword(updatedData) {
    try {
      const response = await fetch("/update-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Error updating password: ${response.statusText}`);
      }

      window.location.href = "/"; // Redirect to homepage after update
    } catch (error) {
      console.error("Error updating password:", error);
    }
  }
});
