    const form = document.forms["sign-up-form"];
    const output = document.getElementById("output");
    const submitbtn=document.getElementById("submit-btn");

    document.getElementById("username-input").addEventListener("change", async () => {
    const username = document.getElementById("username-input").value;    
    const res = await fetch("/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    });

    const data = await res.json();
    if (data.exists) {
        output.innerText = "Username already exists!";
        submitbtn.disabled=true;
    } else {
        output.innerText = "";
        submitbtn.disabled=false;
    }
    });

   async function check_validation(event) {
        const password = form["password"].value;
        const confirm_password = form["confirm_password"].value;

        if (password !== confirm_password) {
                event.preventDefault();
                output.innerHTML = "Password and confirm password do not match.";
                return false;
        }
        // אם יש שגיאה שכבר קיימת משם המשתמש
        if (output.innerText === "Username already exists!") {
            event.preventDefault();
            return false;
        }
        return true;
    }