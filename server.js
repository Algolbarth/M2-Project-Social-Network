const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_ADDON_URI);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
    session({
        secret: "secret-key",
        resave: true,
        saveUninitialized: true,
    }),
);

// Middleware to check if user is authenticated
function auth(req, res, next) {
    if (req?.session?.user) {
        return next();
    } else {
        return res.sendStatus(401);
    }
}

app.post("/login", async function (req, res) {
    const { username, password } = req.body;

    try {
        await client.connect();
        const database = client.db(process.env.MONGODB_ADDON_DB);
        const usersCollection = database.collection("users");
        const user = await usersCollection.findOne({
            username: username,
            password: password,
        });

        if (user) {
            req.session.user = username;
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } finally {
        await client.close();
    }
});

app.post("/logout", function (req, res) {
    req.session.destroy();
    res.sendStatus(200);
});

app.post("/register", async function (req, res) {
    const { username, password } = req.body;

    try {
        await client.connect();
        const database = client.db(process.env.MONGODB_ADDON_DB);
        const usersCollection = database.collection("users");
        const user = await usersCollection.findOne({
            username: username,
        });

        if (user) {
            res.sendStatus(409);
        } else {
            await usersCollection.insertOne({
                username: username,
                password: password,
                status: "user",
                avatarUrl: null,
                firstname: null,
                lastname: null,
                birthdate: null,
            });
            res.sendStatus(201);
        }
    } finally {
        await client.close();
    }
});

app.get("/details", auth, async function (req, res) {
    const username = req.session.user;

    try {
        await client.connect();
        const database = client.db(process.env.MONGODB_ADDON_DB);
        const usersCollection = database.collection("users");
        const user = await usersCollection.findOne({ username: username });

        const eventsCollection = database.collection("events");
        const events = await eventsCollection.find({ username: username }).toArray();

        const favoritesCollection = database.collection("favorites");
        const favorites = await favoritesCollection.find({ username: username }).toArray();

        if (user) {
            res.json({
                ...user,
                _id: undefined,
                events: events,
                favorites: favorites,
            });
        } else {
            res.sendStatus(404);
        }
    } finally {
        await client.close();
    }
});

app.patch("/details", auth, async function (req, res) {
    const username = req.session.user;
    const { firstname, lastname, birthdate, avatarUrl } = req.body;

    // Check if birthdate is a valid date
    if (birthdate && isNaN(Date.parse(birthdate))) {
        return res.sendStatus(400);
    }

    try {
        await client.connect();
        const database = client.db(process.env.MONGODB_ADDON_DB);
        const usersCollection = database.collection("users");
        const user = await usersCollection.findOne({ username: username });

        if (user) {
            const payload = {
                ...(firstname && { firstname: firstname }),
                ...(lastname && { lastname: lastname }),
                ...(birthdate && { birthdate: birthdate }),
                ...(avatarUrl && { avatarUrl: avatarUrl }),
            };

            await usersCollection.updateOne({ username: username }, { $set: payload });
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } finally {
        await client.close();
    }
});

app.get("/events", async function (req, res) {
    try {
        await client.connect();
        const database = client.db(process.env.MONGODB_ADDON_DB);
        const eventsCollection = database.collection("events");
        const events = await eventsCollection.find({}).toArray();
        res.json(events);
    } finally {
        await client.close();
    }
});

app.get("/event/:id", async function (req, res) {
    const { id } = req.params;

    // Check if id is a valid ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.sendStatus(400);
    }

    try {
        await client.connect();
        const database = client.db(process.env.MONGODB_ADDON_DB);
        const eventsCollection = database.collection("events");
        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

        if (event) {
            res.json(event);
        } else {
            res.sendStatus(404);
        }
    } finally {
        await client.close();
    }
});

app.post("/event", auth, async function (req, res) {
    const username = req.session.user;
    const { title, theme, imageUrl, price, date } = req.body;

    // Check if price is a number
    if (isNaN(price)) {
        return res.sendStatus(400);
    }

    // Check if date is a valid date
    if (isNaN(Date.parse(date))) {
        return res.sendStatus(400);
    }

    try {
        await client.connect();
        const database = client.db(process.env.MONGODB_ADDON_DB);
        const eventsCollection = database.collection("events");

        await eventsCollection.insertOne({
            username: username,
            title: title,
            theme: theme,
            imageUrl: imageUrl,
            price: price,
            date: date,
        });

        res.sendStatus(201);
    } finally {
        await client.close();
    }
});

app.put("/event/:id", auth, function (req, res) {
    const { id } = req.params;
    // TODO: Implement event update
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
