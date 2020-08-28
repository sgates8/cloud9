const express =  require("express");
const app = express();
const mysql = require("mysql");
const bodyParser  = require("body-parser");
const PORT = process.env.PORT || 5000;

// We need this for backend form validation
const { check, validationResult } = require("express-validator");
// This is for session storage because we did a login page anyway
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

// Set the templating engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(express.static(__dirname + "/public"));

// Set the mysql connection
let connection = mysql.createConnection({
    host     : 'sq65ur5a5bj7flas.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user     : 'ohabyj452qkno0v0',
    database : 'hkthyoe12txt4hds',
    password : 'uwc6l221fbdb8mtt'
});
// And the session store
let sessionStore = new MySQLStore({
    // Whether or not to automatically check for and clear expired sessions:
    clearExpired: true,
    // How frequently expired sessions will be cleared; milliseconds:
    checkExpirationInterval: 900000,
    // The maximum age of a valid session; milliseconds:
    expiration: 300000,
    // Whether or not to create the sessions database table, if one does not already exist:
    createDatabaseTable: true,
    // Number of connections when creating a connection pool:
    connectionLimit: 1,
    // Whether or not to end the database connection when the store is closed.
    // The default value of this option depends on whether or not a connection was passed to the constructor.
    // If a connection object is passed to the constructor, the default value for this option is false.
    endConnectionOnClose: false,
    // Create the table if it doesn't already exist with these parameters
    charset: "utf8mb4_bin",
    schema: {
        tableName: "sessions",
        columnNames: {
            session_id: "session_id",
            expires: "expires",
            data: "data"
        }
    }
}, connection);

//Set up the session
app.use(session({
    // This is what our session is encryted with
    secret: "CBC9DreamTeam",
    // use the store we created
    store: sessionStore,
    // Always initialize the session
    saveUninitialized: false,
    // And don't re-save it
    resave: false,
    // Session expires in 5 minutes
    maxAge: 300000
}));

// Make our session available to our locals object
app.use(function(req, res, next) {
    res.locals.loggedIn = req.session.loggedIn;
    next();
  });

// Render homepage
app.get("/", (req, res) => {
    res.render("home");
});


app.get("/password", (req, res) => {
    // If login token is still set, go to admin
    if(req.session.loggedIn) {
        return res.redirect("/admin");
    }
    // If login token is not set, enter password
    else {
        res.render("password");
    }
});


// Render customer page
app.get ("/customer", (req, res) => {
    res.render("customer");
});

// Server side form validation
app.post("/register", [
    check("fname")
        // Remove excess whitespace so we can see if we got only spaces
        .trim()
        // Name can't be just empty
        .notEmpty().withMessage("First name is required.")
        // If err, kick the user out to fix it
        .bail()
        // Matches letters spaces hyphens and apostrophes, including unicode characters for people with accents in their names, see https://regex101.com/r/ZKZkOC/4/ for examples
        .matches(/^[^-']([a-zA-ZÀ-ÖØ-öø-ÿ '-](?!.*''|--|  |- |' | '| -.*))+$/, 'g').withMessage("First name should start with a letter, and may only contain letters with spaces, hyphens, and apostrophes.")
        // If err, kick the user out to fix it
        .bail()
        // Match the length of the database column
        .isLength( { min:2, max:30 }).withMessage("Please enter a first name between 2 and 30 characters."),
    check("lname")
        // Same as before but it can be a little longer
        .trim()
        .notEmpty().withMessage("Last name is required.")
        .bail()
        .matches(/^[^-']([a-zA-ZÀ-ÖØ-öø-ÿ '-](?!.*''|--|  |- |' | '| -.*))+$/, 'g').withMessage("Last name should start with a letter, and may only contain letters with spaces, hyphens, and apostrophes.")
        .bail()
        .isLength( { min:2, max:45 }).withMessage("Please enter a last name between 2 and 45 characters."),
    check("phoneNum1")
        // Phone number can't just be empty
        .notEmpty().withMessage("Phone number is required.")
        .bail()
        // Phone number must be numbers
        .isInt().withMessage("Phone numbers may only contain numbers.")
        .bail()
        // Must match the length of the part of the phone number
        .isLength( { min:3, max:3 } ).withMessage("Please enter a ten digit phone number."),
    check("phoneNum2")
        // Only run this if the first set worked
        .if(check("phoneNum1").notEmpty().isInt().isLength( { min:3, max:3 } ))
        .notEmpty().withMessage("Please enter a ten digit phone number.")
        .bail()
        .isInt().withMessage("Phone numbers may only contain numbers.")
        .bail()
        .isLength( { min:3, max:3 }).withMessage("Please enter a ten digit phone number."),
    check("phoneNum3")
        // Only run this if the second set worked which doesn't run if the first set didn't, theoretically
        // I probably made this harder on myself by suggesting to split the phone number fields
        .if(check("phoneNum1").notEmpty().isInt().isLength( { min:3, max:3 } ))
        .if(check("phoneNum2").notEmpty().isInt().isLength( { min:3, max:3 } ))
        .notEmpty().withMessage("Please enter a ten digit phone number.")
        .bail()
        .isInt().withMessage("Phone numbers may only contain numbers.")
        .bail()
        .isLength( { min:4, max:4 }).withMessage("Please enter a ten digit phone number."),
    ], 
    (req, res) => {  
        // Check our results
        let result = validationResult(req);
        // Stuff them in an object
        let errors = result.errors;  
        // Show me the errors in the console
        for (let key in errors) {
            console.log(errors[key].value);
        }
        // Set some variables, removing extra whitespace
        let fname = req.body.fname.trim();
        let lname = req.body.lname.trim();
        let phone = [req.body.phoneNum1, req.body.phoneNum2, req.body.phoneNum3];
        if (!result.isEmpty()) {
            // If errors, send back to form with errors
                res.render("customer", { errors, fname, lname, phone })
        }
        else {
            // If no errors, add information to database
            // Then template out the queries, ?? for column names, ? for values in those columns
            let insert = `INSERT INTO customers(??, ??, ??) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ?? = ?, ?? = ?, ?? = ?`;
            // Actually connect to the database, array is in order of ?s
            connection.query(insert, [
                // columns
                "fname", "lname", "phone", 
                // values
                fname, lname, phone[0]+phone[1]+phone[2],
                // updates column/value pair
                "fname", fname,
                "lname", lname,
                "phone", phone[0]+phone[1]+phone[2]
                ], (err, results) => {
                // If it doesn't work, pitch a fit
                if (err) {
                    console.log(err);
                }
                else {
                // Build success message
                let success = `Woo!`
                // Send success message - consider making a success page or hiding the form on success
                res.render("customer", { success, fname, lname, phone });
                }
            });
        }
});

// Access to the admin page

app.post("/authenticate", [
    check("password")
    // Password has to match string
    .matches("dude").withMessage("Please enter the correct password.")
    ],
    (req, res) => {
    // Check our results
    let result = validationResult(req);
    // Stuff them in an object
    let errors = result.errors;  
    // Show me the errors in the console
    for (let key in errors) {
        console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        // If errors, send back to form with errors
            res.render("password", { errors });
    }
    else {
        // Set the login token
        req.session.loggedIn = true;
        // And go to the admin page
        res.redirect("admin");
    }
});

// Getting all of the infomation from customers
app.get("/admin", (req, res) => {
    // If login token is true, you're good to go
    if (req.session.loggedIn) {
        // Get all the customers
        connection.query('SELECT * FROM customers', (err, rows) => {
            // If no error occurred, build the page
            if(!err) {
            res.render("admin", { rows });
            }
            // If error occurred, direct it to the console log
            else {
            console.log(err);
            }
        });
    }
    else {
        res.redirect("password");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        else {
        res.redirect('/');
        }
    });
});

// And we're running
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})



