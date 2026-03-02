// Configuration - Using your saved Firebase URL
const DB_URL = "https://snmagicalwandreborn-bf5bc-default-rtdb.firebaseio.com/";

/**
 * LOGIN PAGE LOGIC
 * Checks if the entered HWID exists and has access.
 */
async function loginWithHwid() {
    const hwidInput = document.getElementById('loginHwid');
    const status = document.getElementById('status');
    const hwid = hwidInput.value.trim();

    if (!hwid) {
        status.innerText = "Error: Please enter an HWID.";
        return;
    }

    try {
        status.style.color = "#ffaa00";
        status.innerText = "Verifying HWID...";

        // Fetch the specific user node
        const response = await fetch(`${DB_URL}hwid_users/${hwid}.json`);
        const userData = await response.json();

        if (!userData) {
            status.style.color = "#ff4444";
            status.innerText = "Error: HWID not found in database.";
        } else if (userData.is_banned === true) {
            status.style.color = "#ff4444";
            status.innerText = `Banned: ${userData.ban_message || "No reason provided."}`;
        } else {
            // Success: Store HWID and go to dashboard
            localStorage.setItem('rh_active_hwid', hwid);
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        status.style.color = "#ff4444";
        status.innerText = "Network Error. Check your connection.";
        console.error(err);
    }
}

/**
 * DASHBOARD PAGE LOGIC
 * Runs automatically when the dashboard loads.
 */
function initDashboard() {
    const hwid = localStorage.getItem('rh_active_hwid');
    const display = document.getElementById('hwidValue');

    // If no HWID in memory and we are on dashboard, boot them to login
    if (!hwid && window.location.pathname.includes("dashboard.html")) {
        window.location.href = "index.html";
        return;
    }

    if (display) {
        display.innerText = hwid;
    }
}

/**
 * REVEAL & COPY LOGIC
 * Unblurs the box and copies HWID to clipboard.
 */
function revealAndCopy() {
    const box = document.getElementById('hwidDisplay');
    const hwid = localStorage.getItem('rh_active_hwid');

    box.classList.toggle('unblurred');

    if (box.classList.contains('unblurred')) {
        navigator.clipboard.writeText(hwid).then(() => {
            alert("HWID Copied to Clipboard!");
        });
    }
}

/**
 * SYNC LOGIC
 * Manually adds or updates an HWID in the database.
 */
async function syncHwid() {
    const input = document.getElementById('newHwid');
    const hwid = input.value.trim();

    if (!hwid) return alert("Please paste an HWID first.");

    // The data format required by your C# Loader Version 1.0.1
    const payload = {
        has_access: true,
        is_banned: false,
        ban_message: ""
    };

    try {
        const response = await fetch(`${DB_URL}hwid_users/${hwid}.json`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Success! HWID is now authorized.");
            input.value = "";
        }
    } catch (err) {
        alert("Failed to sync: " + err);
    }
}

// Simple Logout
function logout() {
    localStorage.removeItem('rh_active_hwid');
    window.location.href = "index.html";
}

// Run init on every page load
window.onload = initDashboard;
