const login = document.getElementById("login");
const form = document.getElementById("login-form");

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
        login.style.display = 'flex';
        messages.style.display = 'none';
        user.style.display = 'none';
        message_bar.style.display = 'none';
        infos.style.display = 'flex';
        return;
    }

    login.style.display = 'none';
    messages.style.display = 'grid';
    user.style.display = 'flex';
    message_bar.style.display = 'grid';
    infos.style.display = 'none';

    const socket = io();

    // Send a message to the server
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            sendMessage(socket);
        }
    });
    btn_send.addEventListener("click", sendMessage);

    username.addEventListener("click", show_details);

    // Display header
    fetch("/details").then(async (r) => {
        const info = await r.json();
        username.innerHTML = info.username;
    })

    function logout() {
        fetch("/logout", {
            method: "POST",
        }).then(async (response) => {
            if (!response.ok) {
                alert("You are not logged in");
                return;
            }

            login.style.display = 'flex';
            messages.style.display = 'none';
            user.style.display = 'none';
            message_bar.style.display = 'none';
            infos.style.display = 'flex';
        });
    };
    btn_logout.addEventListener("click", logout);

    // Display chat history
    display_chat(response);

    // Listen for messages from the server
    socket.on("message", function (data) {
        const { username, message, date } = data;
        addMessage(username, message, date);
    });
});