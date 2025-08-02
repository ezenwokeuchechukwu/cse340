document.getElementById("showPassword").addEventListener("click", function () {
	const passwordInput = document.getElementById("account_password");
	const showPasswordButton = document.getElementById("showPassword");

	if (passwordInput.type === "password") {
		passwordInput.type = "text";
		showPasswordButton.textContent = "Hide";
	} else {
		passwordInput.type = "password";
		showPasswordButton.textContent = "Show";
	}
});
