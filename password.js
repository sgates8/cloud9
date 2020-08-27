function checkPassword() {
    var password = document.getElementById("passwordContainer");
    var passwordText = password.value;
    if(passwordText == "dude") {
       return window.location.href ='C:\Users\student\Desktop\cbc9\cloud9\admin.html';
    }
    alert("Access denied, try again please");
    return false;
    }

