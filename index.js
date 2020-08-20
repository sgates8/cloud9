const express =  require("express");
const app = express();
const PORT = process.env.PORT || 5000
const mysql = require('mysql');
const bodyParser  = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

let connection = mysql.createConnection({
    host     : '',
    user     : '',
    database : '',
    password : ''
});


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

var connection = mysql.createConnection({
    host     : '',
    user     : '',
    database : '',
    password : ''
});


app.get("/", (req,res) => {
    res.render("home")
});


app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})
