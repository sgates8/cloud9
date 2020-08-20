const express =  require("express")
const app = express()
var mysql = require('mysql');
var bodyParser  = require("body-parser");
const PORT = process.env.PORT || 5000

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
