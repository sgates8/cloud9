const express =  require("express")
const app = express()
const PORT = process.env.PORT || 5000

app.get("/", (req,res) => {
    res.send("test")
});


app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})

//set up for connection
const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
const PORT = process.env.PORT || 5000


app.use(bodyparser.json)
// connect to mySQL
var connection = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'',
    database:'cloud9DB',
});

connection.connect((err)=>{
    if(!err) {
        console.log('connected');
     } else{
        console.log('error \n Error: '+ JSON.strinify(err, undefined, 2));
     }
}); 

// server running
app.listen(5000, () => {
    console.log(`server running on 5000`)
});

// getting all of the infomation from customers
app.get("/customers",(req,res)=>{
    connection.query('SELECT * FROM customers',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log('err');
    })
});
