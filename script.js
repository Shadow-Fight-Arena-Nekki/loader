const DB_URL = "https://snmagicalwandreborn-bf5bc-default-rtdb.firebaseio.com/";

/**
 * HWID-ONLY LOGIN LOGIC
 */
async function loginWithHwid() {
    const hwidInput = document.getElementById('loginHwid');
    const hwid = hwidInput.value.trim();
    const status = document.getElementById('status');

    if (!hwid) {
        status.innerText = "ERROR: TERMINAL ID REQUIRED.";
        status.style.color = "#ff0000";
        return;
    }

    try {
        status.style.color = "#00ff41";
        status.innerText = "Requesting Authorization...";

        const response = await fetch(`${DB_URL}hwid_users/${hwid}.json`);
        const userData = await response.json();

        if (userData && userData.has_access) {
            // SUCCESS
            localStorage.setItem('rh_session_token', hwid); // Professional key name
            window.location.href = "dashboard.html";
        } else if (userData && userData.is_banned) {
            status.innerText = `ACCESS DENIED: ${userData.ban_message || "TERMINAL BANNED."}`;
            status.style.color = "#ff0000";
        } else {
            status.innerText = "ACCESS DENIED: INVALID TERMINAL ID OR EXPIRED.";
            status.style.color = "#ff0000";
        }
    } catch (e) {
        status.innerText = "CRITICAL ERROR: SERVER UNREACHABLE.";
        status.style.color = "#ff0000";
        console.error(e);
    }
}

/**
 * DASHBOARD INITIALIZATION & PROTECTION
 */
function init() {
    const hwid = localStorage.getItem('rh_session_token');
    if (window.location.pathname.includes("dashboard.html")) {
        // Protection: If not logged in, boot to gateway
        if (!hwid) {
            window.location.href = "index.html";
            return;
        }
        const display = document.getElementById('hwidValue');
        if (display) display.innerText = hwid;
    }
}

/**
 * REVEAL & COPY LOGIC
 */
function revealAndCopy() {
    const box = document.getElementById('hwidDisplay');
    const hwid = localStorage.getItem('rh_session_token');

    if (!hwid) return;

    box.classList.toggle('unblurred');

    if (box.classList.contains('unblurred')) {
        navigator.clipboard.writeText(hwid).then(() => {
            // Subtle, professional feedback (you could add a small visual pulse here)
            console.log("Terminal ID copied to clipboard.");
        });
    }
}

/**
 * HWID SYNC LOGIC (Adds new device)
 */
async function syncHwid() {
    const input = document.getElementById('newHwid');
    const hwid = input.value.trim();

    if (!hwid) {
        alert("ERROR: Enter a valid Terminal ID.");
        return;
    }

    // Standard payload expected by C# Loader 1.0.1
    const payload = {
        has_access: true,
        is_banned: false,
        ban_message: ""
    };

    try {
        alert("Initializing sync protocol...");
        const res = await fetch(`${DB_URL}hwid_users/${hwid}.json`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("SYNC COMPLETE: Terminal ID Authorized.");
            input.value = "";
        } else {
            alert("SYNC FAILED: Server rejected request.");
        }
    } catch (err) {
        alert("CRITICAL ERROR: Sync protocol interrupted.");
        console.error(err);
    }
}

/**
 * LOGOUT LOGIC
 */
function logout() {
    localStorage.removeItem('rh_session_token');
    window.location.href = "index.html";
}

// Run init on every page load
window.onload = init;
