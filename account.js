// account.js - Handles Sign Up, Login, Logout, and Auto Sync

import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const loginBox = document.getElementById("login-box");
const accountBox = document.getElementById("account-box");

const emailInput = document.getElementById("email-input");
const passInput = document.getElementById("pass-input");

const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

const userEmailDisplay = document.getElementById("user-email");

function showLogin() {
  loginBox.style.display = "flex";
  accountBox.style.display = "none";
}

function showAccount(email) {
  loginBox.style.display = "none";
  accountBox.style.display = "flex";
  userEmailDisplay.textContent = email;

  // Auto-load settings to localStorage
  loadUserData();
}

async function loadUserData() {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();

    // Push to localStorage so settings page sees them
    if (data.settings) {
      for (const [k, v] of Object.entries(data.settings)) {
        localStorage.setItem(k, v);
      }
    }
  }
}

async function saveUserData() {
  const user = auth.currentUser;
  if (!user) return;

  // Collect ALL S0LACE settings from localStorage
  const settings = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("s0lace")) settings[key] = localStorage.getItem(key);
  }

  await setDoc(doc(db, "users", user.uid), { settings }, { merge: true });
}

// Automatically sync every 5 seconds
setInterval(saveUserData, 5000);

// SIGN UP ----------------------------
signupBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value, passInput.value);
    alert("Account created!");
  } catch (err) {
    alert(err.message);
  }
});

// LOGIN ----------------------------
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
  } catch (err) {
    alert(err.message);
  }
});

// LOG OUT ---------------------------
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// WATCH LOGIN STATE -----------------
onAuthStateChanged(auth, (user) => {
  if (user) showAccount(user.email);
  else showLogin();
});
