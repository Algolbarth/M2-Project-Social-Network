const details = document.getElementById("details");

function show_details() {
    fetch("/details").then(async (response) => {
        if (!response.ok) {
            alert("You are not logged in");
            return;
        }

        details.style.display = 'block';
        messages.style.display = 'none';
        message_bar.style.display = 'none';

        const info = await response.json();

        details.innerHTML = info.username;
    });
};