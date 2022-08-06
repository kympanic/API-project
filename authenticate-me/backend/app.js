const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { ValidationError } = require("sequelize");

const { environment } = require("./config");
const isProduction = environment === "production";

const app = express();

//middleware for login information about requests and responses
app.use(morgan("dev"));

//middleware for parsing cookies and
app.use(cookieParser());

//middleware for parsing JSON bodies of requests with content-type "application/json"
app.use(express.json());

//only allow CORS(cross-origin resource sharing) in development using the cors middleware b/c
//REACT frontend will be served from a different server than the express server. CORS isnt needed in production
//since all of our resources will come from the same origin

if (!isProduction) {
	app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
	helmet.crossOriginResourcePolicy({
		policy: "cross-origin",
	})
);

// Set the _csrf token and create req.csrfToken method
app.use(
	csurf({
		cookie: {
			secure: isProduction,
			sameSite: isProduction && "Lax",
			httpOnly: true,
		},
	})
);

app.use(routes);

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
	const err = new Error("The requested resource couldn't be found.");
	err.title = "Resource Not Found";
	err.errors = ["The requested resource couldn't be found."];
	err.status = 404;
	next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
	// check if error is a Sequelize error:
	if (err instanceof ValidationError) {
		err.errors = err.errors.map((e) => e.message);
		err.title = "Validation error";
	}
	next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
	res.status(err.status || 500);
	console.error(err);
	res.json({
		title: err.title || "Server Error",
		message: err.message,
		errors: err.errors,
		stack: isProduction ? null : err.stack,
	});
});

module.exports = app;
