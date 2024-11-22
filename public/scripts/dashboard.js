function toggleMapLinks() {
    const mapLinks = document.getElementById('mapLinks');
    if (mapLinks.classList.contains('hidden')) {
        mapLinks.classList.remove('hidden');
    } else {
        mapLinks.classList.add('hidden'); 
    }
}

function openMapPopup(url) {
    const popupWidth = 800;
    const popupHeight = 600;

    const left = (screen.width - popupWidth) / 2;
    const top = (screen.height - popupHeight) / 2;

    window.open(
        url, 
        'MapPopup', 
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
}


function toggleCardBody(button) {
    const cardBody = button.closest('.card').querySelector('.card-body');
    const icon = button.querySelector('i');

    // Toggle the collapse state
    if (cardBody.classList.contains('show')) {
        cardBody.classList.remove('show');
        cardBody.classList.add('collapsed');
        icon.classList.remove('bi-dash');
        icon.classList.add('bi-plus');
    } else {
        cardBody.classList.remove('collapsed');
        cardBody.classList.add('show');
        icon.classList.remove('bi-plus');
        icon.classList.add('bi-dash');
    }
}
