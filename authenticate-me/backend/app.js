const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const routes = require("./routes");

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

module.exports = app;
