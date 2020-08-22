const express =  require("express");
const app = express();
const mysql = require("mysql");
const bodyParser  = require("body-parser");
const PORT = process.env.PORT || 5000

// We need this for backend form validation
const { check, validationResult } = require("express-validator");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(express.static(__dirname + "/public"));

let connection = mysql.createConnection({
    host     : '',
    user     : '',
    database : '',
    password : ''
});


app.get("/", (req,res) => {
    res.render("home")
});

// Server side form validation
app.post("/register", [
    check("fname")
        // Name can't be just empty
        .not().isEmpty().withMessage("First name is required.")
        // Trim excess whitespace on the ends and escape html characters
        .trim().escape()
        // Matches letters spaces hyphens and apostrophes - there is an enhancement waiting to be added to validator.js that will add this to isAlpha but it isn't done yet
        .matches("/^[A-Za-z '-]$/").withMessage("Names may only contain letters with spaces, hyphens, and apostrophes.")
        // Match the length of the database column
        .isLength( { min:2, max:30 }).withMessage("Please enter a first name between 2 and 30 characters."),
    check("lname")
        .not().isEmpty().withMessage("Last name is required.")
        .trim().escape()
        .matches("/^[A-Za-z '-]$/").withMessage("Names may only contain letters with spaces, hyphens, and apostrophes.")
        .isLength( { min:2, max:45 }).withMessage("Please enter a last name between 2 and 45 characters."),
    check("phoneNum1")
        // Phone number can't just be empty
        .not().isEmpty().withMessage("Phone number is required.")
        // Phone number must be numbers
        .isInt().withMessage("Phone numbers may only contain numbers.")
        // Must match the length of the part of the phone number
        .isLength( { min:3, max:3 }).withMessage("Please enter a ten digit phone number.")
        // If err, bail out here and send error message (because all phone number length errors are the same, next block bails as well)
        .bail(),
    check("phoneNum2")
        .not().isEmpty().withMessage("Phone number is required.")
        .isInt().withMessage("Phone numbers may only contain numbers.")
        .isLength( { min:3, max:3 }).withMessage("Please enter a ten digit phone number.")
        .bail(),
    check("phoneNum3")
        .not().isEmpty().withMessage("Phone number is required.")
        .isInt().withMessage("Phone numbers may only contain numbers.")
        .isLength( { min:4, max:4 }).withMessage("Please enter a ten digit phone number."),
    ], 
    (req, res) => {  
        // Check our results
        const result = validationResult(req);
        // Stuff them in an object
        let errors = result.errors;  
        // Show me the errors in the console
        for (let key in errors) {
            console.log(errors[key].value);
    }
    if (!result.isEmpty()) {
        // If errors, send back to form with errors
            res.render("home", { errors })
    }
    else {
        // If no errors, add information to database

        // This is where database functions go
        // Nest the connection queries
        // Nest res.render in the final query
        // Should probably ask Nick if there is a better way to do that with async/await

        // And also send a success
        let success = "Thank you for registering!"
        res.render("home", { success })
    }
});


app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
});
