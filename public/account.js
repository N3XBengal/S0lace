/* ================================
   S0LACE ACCOUNT SYSTEM (LOCAL)
   No email, no Firebase.
   Username + export/import profile.
================================ */

const usernameInput = document.getElementById("username-input");
const createBtn = document.getElementById("create-btn");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const fileInput = document.getElementById("import-file");
const logoutBtn = document.getElementById("logout-btn");
const userLabel = document.getElementById("account-username");

const S0_KEYS = [
  "s0laceUser",
  "s0laceAccent",
  "s0laceTheme",
  "s0laceBgMode",
  "s0laceBgUrl",
  "s0laceTabCloak",
  "s0laceAntiClose",
  "s0laceStartupBlank",
  "s0laceMediaCache",
  "game_progress",
];

// Load UI on startup
function initAccount() {
  const user = localStorage.getItem("s0laceUser");

  if (user) {
    userLabel.textContent = user;
    document.getElementById("loggedin-section").style.display = "block";
    document.getElementById("login-section").style.display = "none";
  } else {
    document.getElementById("loggedin-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
  }
}

createBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name.length) return alert("Enter a username.");

  localStorage.setItem("s0laceUser", name);
  initAccount();
});

/* ================================
   EXPORT PROFILE
================================ */
exportBtn.addEventListener("click", () => {
  const profile = {};

  S0_KEYS.forEach(key => {
    profile[key] = localStorage.getItem(key);
  });

  const blob = new Blob([JSON.stringify(profile, null, 2)], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "solace-profile.json";
  a.click();
});

/* ================================
   IMPORT PROFILE
================================ */
importBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      Object.keys(data).forEach(k => {
        if (data[k] !== null && data[k] !== undefined) {
          localStorage.setItem(k, data[k]);
        }
      });

      initAccount();
      alert("Profile loaded successfully!");

    } catch {
      alert("Invalid profile file.");
    }
  };
  reader.readAsText(file);
});

/* ================================
   LOGOUT
================================ */
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("s0laceUser");
  initAccount();
});

initAccount();
