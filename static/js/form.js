const form = document.forms["sign-up-form"];
const password_input = form["password"];
const confirm_password_input = form["confirm_password"];
const output = document.getElementById("output");
const submitbtn = document.getElementById("submit-btn");
const username_input = document.getElementById("username-input");

let usernameTaken = false;
let passwordTooShort = false;
let passwordsDontMatch = false;

function validateFormFields() {
    if (usernameTaken || passwordTooShort || passwordsDontMatch) {
        submitbtn.disabled = true;
    } else {
        submitbtn.disabled = false;
    }
}

username_input.addEventListener("change", async () => {
    const username = username_input.value;    
    const res = await fetch("/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    });

    const data = await res.json();
    if (data.exists) {
        output.innerText = "Username already exists!";
        usernameTaken = true;
        username_input.classList.add("err");
    } else {
        if (output.innerText === "Username already exists!") {
            output.innerText = "";
        }
        usernameTaken = false;
        username_input.classList.remove("err");
    }

    validateFormFields();
});

password_input.addEventListener("change", () => {
    const password = password_input.value;
    passwordTooShort = password.length < 4;

    if (passwordTooShort) {
        output.innerText = "Password must be minimum of 4 letters!";
        password_input.classList.add("err");
    } else {
        if (output.innerText === "Password must be minimum of 4 letters!") {
            output.innerText = "";
        }
        password_input.classList.remove("err");
    }

    validateFormFields();
});

confirm_password_input.addEventListener("change", () => {
    validatePasswordMatch();
    validateFormFields();
});

function validatePasswordMatch() {
    const password = password_input.value;
    const confirm = confirm_password_input.value;
    passwordsDontMatch = password !== confirm;

    if (passwordsDontMatch) {
        output.innerText = "Passwords do not match!";
        confirm_password_input.classList.add("err");
    } else {
        if (output.innerText === "Passwords do not match!") {
            output.innerText = "";
        }
        confirm_password_input.classList.remove("err");
    }
}

async function check_validation(event) {
    if (usernameTaken || passwordTooShort || passwordsDontMatch) {
        event.preventDefault();
        output.innerText = "Please fix all errors before submitting.";
        return false;
    }
    return true;
}
