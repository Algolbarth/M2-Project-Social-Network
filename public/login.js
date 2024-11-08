const login = document.getElementById("login");
const login_form = document.getElementById("login-form");
const btn_register = document.getElementById("btn_register");
const register = document.getElementById("register");
const btn_login = document.getElementById("btn_login");

login_form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(login_form);
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

btn_register.addEventListener("click", function (event) {
    login.style.display = 'none';
    register.style.display = 'flex';
});

btn_login.addEventListener("click", function (event) {
    login.style.display = 'flex';
    register.style.display = 'none';
});

// Check if user is logged in with a session cookie
fetch("/history").then(async (response) => {
    if (!response.ok) {
        alert("You are not logged in");
        login.style.display = 'flex';
        register.style.display = 'none';
        messages.style.display = 'none';
        user.style.display = 'none';
        message_bar.style.display = 'none';
        infos.style.display = 'flex';
        return;
    };

    login.style.display = 'none';
    register.style.display = 'none';
    messages.style.display = 'grid';
    user.style.display = 'flex';
    message_bar.style.display = 'grid';
    infos.style.display = 'none';

    function menu() {
        details.style.display = 'none';
        messages.style.display = 'grid';
        message_bar.style.display = 'grid';
    };
    title.addEventListener("click", menu);

    fetch("/details").then(async (r) => {
        const info = await r.json();
        username.innerHTML = info.username;
    });
    username.addEventListener("click", show_details);

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
    const socket = io();

    // Send a message to the server
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            sendMessage(socket);
        }
    });
    btn_send.addEventListener("click", () => { sendMessage(socket) });

    socket.on("message", function (data) {
        const { username, message, date } = data;
        addMessage(username, message, date);
    });
});