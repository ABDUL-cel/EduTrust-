// server.js / app.js
// Make sure your Express app serves the dashboard pages.

const express = require("express");
const path = require("path");

const app = express();

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// API routes
const apiRoutes =
    require("./routes");

app.use(
    apiRoutes
);


// Parent registration page
app.get(
    "/parent/register",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "parent-register.html"
            )
        );

    }
);


// Parent dashboard page
app.get(
    "/parent/dashboard-page",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "parent-dashboard.html"
            )
        );

    }
);


// Home page
app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


// 404
app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found."

        });

    }
);


const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `EduTrust server running on port ${PORT}`
        );

    }
);
