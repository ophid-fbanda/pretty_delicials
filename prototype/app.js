const form = document.getElementById("auth-form");
const hint = document.getElementById("form-hint");
const errorEl = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");
const extras = document.querySelectorAll(".extra");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const authScreen = document.getElementById("auth-screen");
const resultScreen = document.getElementById("result-screen");
const resultTitle = document.getElementById("result-title");
const resultCopy = document.getElementById("result-copy");

let mode = "login";

function setMode(next) {
  mode = next;
  const creating = mode === "create";

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    const on = btn.dataset.mode === mode;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-selected", String(on));
  });

  extras.forEach((field) => {
    field.hidden = !creating;
  });
  nameInput.required = creating;
  hint.textContent = creating
    ? "Phone and preferred name. Email is optional."
    : "Enter the phone on your account.";
  submitBtn.textContent = creating ? "Create account" : "Login";
  errorEl.hidden = true;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.hidden = true;

  const phone = phoneInput.value.trim();
  const preferredName = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!phone) {
    showError("Phone number is required.");
    phoneInput.focus();
    return;
  }

  if (mode === "create" && !preferredName) {
    showError("Preferred name is required.");
    nameInput.focus();
    return;
  }

  if (email && !email.includes("@")) {
    showError("Enter a real email, or leave it blank.");
    emailInput.focus();
    return;
  }

  authScreen.hidden = true;
  resultScreen.hidden = false;

  if (mode === "create") {
    resultTitle.textContent = "Account created";
    resultCopy.textContent =
      preferredName +
      ", this is the prototype. You would be a Client until Admin gives a team role. Nothing is saved on a server yet.";
  } else {
    resultTitle.textContent = "You're in";
    resultCopy.textContent =
      "Logged in with " + phone + ". Prototype only — no backend, no role yet.";
  }
});

document.getElementById("back-btn").addEventListener("click", () => {
  resultScreen.hidden = true;
  authScreen.hidden = false;
});
