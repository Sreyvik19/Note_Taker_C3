document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");
    const loginButton = document.getElementById("loginButton");
    const buttonText = document.getElementById("buttonText");
    const loadingIcon = document.getElementById("loadingIcon");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        errorMessage.style.display = "none";

        if (email === "" || password === "") {
            errorMessage.textContent = "Please enter email and password.";
            errorMessage.style.display = "block";
            return;
        }

        // Loading state
        buttonText.textContent = "Signing in...";
        loadingIcon.style.display = "inline-block";
        loginButton.disabled = true;

        setTimeout(function () {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userEmail", email);

            // REDIRECT
            window.location.href = "main.html";
        }, 1500);
    });

});
