function toggleMapLinks() {
  const mapLinks = document.getElementById("mapLinks");
  if (mapLinks.classList.contains("hidden")) {
    mapLinks.classList.remove("hidden");
  } else {
    mapLinks.classList.add("hidden");
  }
}

function openMapPopup(url) {
  const popupWidth = 800;
  const popupHeight = 600;

  const left = (screen.width - popupWidth) / 2;
  const top = (screen.height - popupHeight) / 2;

  window.open(
    url,
    "MapPopup",
    `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,resizable=yes`
  );
}
