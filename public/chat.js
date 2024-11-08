const messages = document.getElementById("messages");
const message_bar = document.getElementById("message_bar");
const btn_send = document.getElementById("message-btn");
const input = document.getElementById("message");

function sendMessage(socket) {
    const input = document.getElementById("message");
    const message = input.value;
    socket.emit("message", message);
    input.value = "";
};

function addMessage(pseudo, message, date_info) {
    const row = document.createElement("div");
    row.classList.add('row');

    let date = new Date(date_info);

    let minutes = date.getMinutes();
    minutes = minutes > 10 ? minutes : "0" + minutes;

    const date_cell = document.createElement("div");
    date_cell.textContent = "[" + date.getHours() + ":" + minutes + "]";
    row.appendChild(date_cell);

    const username_cell = document.createElement("div");
    username_cell.textContent = pseudo;
    row.appendChild(username_cell);

    const message_cell = document.createElement("div");
    message_cell.textContent = message;
    row.appendChild(message_cell);

    messages.appendChild(row);
};

async function display_chat (response) {
    const history = await response.json();
    history.forEach((data) => {
        const { username, message, date } = data;
        addMessage(username, message, date);
    });
};