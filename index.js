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
    host     : 'localhost',
    user     : 'root',
    database : 'cloud9',
    password : 'root'
});


app.get("/", (req,res) => {
    res.render("home")
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
        .matches(/^(((?!.*'.*)(?!.*-.*)([ ]*))|([\p{L}]+))(?!.*''.*)(?!.*--.*)(?!.*  .*)[\p{L} '-]*$/gmu).withMessage("First name should start with a letter, and may only contain letters with spaces, hyphens, and apostrophes.")
        // If err, kick the user out to fix it
        .bail()
        // Match the length of the database column
        .isLength( { min:2, max:30 }).withMessage("Please enter a first name between 2 and 30 characters."),
    check("lname")
        // Same as before but it can be a little longer
        .trim()
        .notEmpty().withMessage("Last name is required.")
        .bail()
        .matches(/^(((?!.*'.*)(?!.*-.*)([ ]*))|([\p{L}]+))(?!.*''.*)(?!.*--.*)(?!.*  .*)[\p{L} '-]*$/gmu).withMessage("Last name should start with a letter, and may only contain letters with spaces, hyphens, and apostrophes.")
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
        .notEmpty().withMessage("Phone number is required.")
        .bail()
        .isInt().withMessage("Phone numbers may only contain numbers.")
        .bail()
        .isLength( { min:3, max:3 }).withMessage("Please enter a ten digit phone number."),
    check("phoneNum3")
        // Only run this if the second set worked which doesn't run if the first set didn't, theoretically
        // I probably made this harder on myself by suggesting to split the phone number fields
        .if(check("phoneNum1").notEmpty().isInt().isLength( { min:3, max:3 } ))
        .if(check("phoneNum2").notEmpty().isInt().isLength( { min:3, max:3 } ))
        .notEmpty().withMessage("Phone number is required.")
        .bail()
        .isInt().withMessage("Phone numbers may only contain numbers.")
        .bail()
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
        // First set some variables, removing extra whitespace
        // Ask about escape/unescape
        let fname = req.body.fname.trim();
        let lname = req.body.lname.trim();
        let phone = req.body.phoneNum1+req.body.phoneNum2+req.body.phoneNum3;
        // Then template out the query, ?? for column names, ? for values in those columns
        let insert = `INSERT INTO customers(??, ??, ??) VALUES (?, ?, ?)`
        // Actually connect to the database, array is in order of ?s
        connection.query(insert, ["fname", "lname", "phone", fname, lname, phone], (err, results) => {
            // If it doesn't work, pitch a fit
            if (err) throw err;
            // Build success message
            let success = `Thank you for registering, ${fname} ${lname}!  We'll text you coupon codes at (${req.body.phoneNum1}) ${req.body.phoneNum2}-${req.body.phoneNum3}.`
            // Send success message - consider making a success page or hiding the form on success
            res.render("home", { success });
        });
    }
});


app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
});
