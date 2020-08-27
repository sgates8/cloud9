const express =  require("express");
const app = express();
const mysql = require("mysql");
const bodyParser  = require("body-parser");
const PORT = process.env.PORT || 5000;

// We need this for backend form validation
const { check, validationResult } = require("express-validator");

// Set the templating engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded( { extended: true } ));
// app.use(bodyParser.json);
app.use(express.static(__dirname + "/public"));

// Set the mysql connection
let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    database : 'cloud9',
    password : 'root'
});

// Render homepage
app.get("/", (req, res) => {
    res.render("home");
});


app.get("/password", (req, res) => {
    res.render("password");
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
            // Then template out the query, ?? for column names, ? for values in those columns
            let insert = `INSERT INTO customers(??, ??, ??) VALUES (?, ?, ?)`;
            // Actually connect to the database, array is in order of ?s
            connection.query(insert, ["fname", "lname", "phone", fname, lname, phone[0]+phone[1]+phone[2]], (err, results) => {
                // If it doesn't work, pitch a fit
                if (err) {
                    throw err;
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

// Getting all of the infomation from customers
app.get("/admin",(req,res)=>{
    connection.query('SELECT * FROM customers',(err, rows, fields)=>{
        if(!err) {
        res.render("admin",{rows});
        }
        else {
        console.log(err);
        }
    })
});

// And we're running
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})

/*  I am not sure this is doing anything here except poking the database, we already have if err where we make queries.

connection.connect((err)=>{
    if(!err) {
        console.log('connected');
    } else{
        console.log('error \n Error: '+ JSON.strinify(err, undefined, 2));
    }
}); 
*/



