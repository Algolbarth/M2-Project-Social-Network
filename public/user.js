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

        details.innerHTML = "";
        details.innerHTML += "<img class='event' src=" + info.avatarUrl + "/> <br />";
        details.innerHTML += "Username: " + info.username + "<br />";
        details.innerHTML += "First name: " + info.firstname + "<br />";
        details.innerHTML += "Last name: " + info.lastname + "<br />";

        details.innerHTML += "Birthdate: " + print_date(new Date(info.birthdate)) + "<br /><br />";

        details.innerHTML += "Status: " + info.status + "<br /><br />";

        if (info.events.length > 0) {
            details.innerHTML += info.events.length + " Events: <br />";
            for (const event of info.events) {
                details.innerHTML += "<img class='event' src=" + event.imageUrl + "/>";
                details.innerHTML += event.title + " " + print_date(new Date(event.date)) + "<br />";
            }
        }
        else {
            details.innerHTML += "No Event";
        }
    });
};

function print_date (date) {
    return (date.getMonth() + 1) + "/" + date.getDay() + "/"+ date.getFullYear();
}