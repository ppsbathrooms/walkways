require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoute = require("./routes/auth");
const cookieSession = require("cookie-session");
const app = express();
require("./passport");

app.use(
	cookieSession({
		name: "session",
		keys: [process.env.SESSION_SECRET],
		maxAge: 24 * 60 * 60 * 100,
	})
);

app.use(passport.initialize());
app.use(passport.session());

// frontend url
app.use(
	cors({
		origin: "http://localhost:42069",
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

app.use("/auth", authRoute);

const port = process.env.PORT || 42068;
app.listen(port, () => console.log(`Listenting on port ${port}...`));