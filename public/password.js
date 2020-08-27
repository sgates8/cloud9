function checkPassword() {
    var password = document.getElementById("passwordContainer");
    var passwordText = password.value;
    if(passwordText == "dude") {
       return window.location.href ='admin';
    }
    alert("Access denied, try again please");
    return false;
    }

