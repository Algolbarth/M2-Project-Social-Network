const form = document.getElementById("login-form");
const messages = document.getElementById("messages");
const user = document.getElementById("user");
const btn_logout = document.getElementById("logout");
const footer = document.querySelector('footer');

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    fetch("/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(() => {
        location.reload();
    });
});

// Check if user is logged in with a session cookie
fetch("/history").then(async (response) => {
    if (!response.ok) {
        alert("You are not logged in");
        form.style.display = 'block';
        messages.style.display = 'none';
        user.style.display = 'none';
        footer.style.display = 'none';
        return;
    }

    form.style.display = 'none';
    messages.style.display = 'grid';
    user.style.display = 'block';
    footer.style.display = 'grid';

    const history = await response.json();
    const socket = io();

    function addMessage(username, message, date_info) {
        const row = document.createElement("div");
        row.classList.add('row');

        let date = new Date(date_info);

        let minutes = date.getMinutes();
        minutes = minutes > 10 ? minutes : "0" + minutes;

        const date_cell = document.createElement("div");
        date_cell.textContent = "[" + date.getHours() + ":" + minutes + "]";
        row.appendChild(date_cell);

        const username_cell = document.createElement("div");
        username_cell.textContent = username;
        row.appendChild(username_cell);

        const message_cell = document.createElement("div");
        message_cell.textContent = message;
        row.appendChild(message_cell);

        messages.appendChild(row);

        console.log(messages)
    }

    // Display chat history
    history.forEach((data) => {
        const { username, message, date } = data;
        addMessage(username, message, date);
    });

    // Send a message to the server
    function sendMessage() {
        const input = document.getElementById("message");
        const message = input.value;
        socket.emit("message", message);
        input.value = "";
    };

    const input = document.getElementById("message");
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    const btn_send = document.getElementById("message-btn");
    btn_send.addEventListener("click", sendMessage);

    // Logout
    function logout() {
        fetch("/logout", {
            method: "POST",
        }).then(async (response) => {
            if (!response.ok) {
                alert("You are not logged in");
                return;
            }
            form.style.display = 'block';
            messages.style.display = 'none';
            user.style.display = 'none';
            footer.style.display = 'none';
        });
    };

    btn_logout.addEventListener("click", logout);

    // Listen for messages from the server
    socket.on("message", function (data) {
        const { username, message, date } = data;
        addMessage(username, message, date);
    });
});