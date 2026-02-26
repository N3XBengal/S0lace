"use strict";

/**
 * Proxy UI elements (may be null on non-home pages)
 * @type {HTMLFormElement|null}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement|null}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement|null}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement|null}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement|null}
 */
const errorCode = document.getElementById("sj-error-code");

/**
 * Only initialize Scramjet + BareMux if:
 * - We are on a page that actually has the proxy elements
 * - The Scramjet loader + BareMux globals exist
 */
if (
  form &&
  address &&
  searchEngine &&
  error &&
  errorCode &&
  typeof window.$scramjetLoadController === "function" &&
  window.BareMux
) {
  const { ScramjetController } = $scramjetLoadController();

  const scramjet = new ScramjetController({
    files: {
      wasm: "/scram/scramjet.wasm.wasm",
      all: "/scram/scramjet.all.js",
      sync: "/scram/scramjet.sync.js",
    },
  });

  scramjet.init();

  const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      // 1. Register Service Worker
      if (typeof registerSW === "function") {
        await registerSW();
      } else {
        console.warn("registerSW is not defined");
      }

      // 2. Prepare URL
      const url = search(address.value, searchEngine.value);
      let wispUrl =
        (location.protocol === "https:" ? "wss" : "ws") +
        "://" +
        location.host +
        "/wisp/";

      // 3. Setup BareMux Transport (This is where your error was happening)
      const current = await connection.getTransport();
      if (current !== "/epoxy/index.mjs") {
        await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
      }

      // 4. Create and inject the frame
      const frame = scramjet.createFrame();
      frame.frame.id = "sj-frame";
      document.body.appendChild(frame.frame);
      frame.go(url);

    } catch (err) {
      console.error("Proxy Error:", err);
      
      // AUTO-FIX: Check for the specific DB error and reset if found
      if (err.name === 'NotFoundError' || err.message.includes('object store')) {
          console.warn("BareMux Database is corrupted. Resetting...");
          // Delete the corrupted database
          const req = indexedDB.deleteDatabase("bare-mux");
          req.onsuccess = () => {
              // Reload to re-initialize cleanly
              location.reload();
          };
          // Update UI while reloading
          if (error) error.textContent = "Database fixed. Reloading...";
          return;
      }

      if (error) error.textContent = "Failed to initiate proxy.";
      if (errorCode) errorCode.textContent = err.toString();
      throw err;
    }
  });
} else {
  // Not on the proxy page or libs not loaded – do nothing.
}
<script>
  // This is your list of "Allowed" passwords. 
  // You can change these or add as many as you want!
  const validPasswords = ["pizza123", "taco456", "secret789", "admin_only"];

  let access = false;
  
  // This pops up a box as soon as the page loads
  const userPass = prompt("Enter your unique access code:");

  if (validPasswords.includes(userPass)) {
    access = true;
    alert("Access Granted. Welcome!");
  } else {
    alert("Wrong code. Access Denied.");
    // This sends them to Google if they get it wrong
    window.location.href = "https://www.google.com"; 
  }
</script>
