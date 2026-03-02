const DB_URL = "https://snmagicalwandreborn-bf5bc-default-rtdb.firebaseio.com/";

async function loginWithHwid() {
    const hwid = document.getElementById('loginHwid').value.trim();
    const status = document.getElementById('status');

    if (!hwid) { status.innerText = "HWID Required."; return; }

    try {
        const response = await fetch(`${DB_URL}hwid_users/${hwid}.json`);
        const data = await response.json();

        if (data && data.has_access) {
            localStorage.setItem('session_hwid', hwid);
            window.location.href = "dashboard.html";
        } else {
            status.innerText = "Invalid HWID or Access Expired.";
            status.style.color = "#ff4b2b";
        }
    } catch (e) { status.innerText = "Server error."; }
}

function init() {
    const hwid = localStorage.getItem('session_hwid');
    if (window.location.pathname.includes("dashboard.html")) {
        if (!hwid) { window.location.href = "index.html"; return; }
        document.getElementById('hwidValue').innerText = hwid;
    }
}

function revealAndCopy() {
    const box = document.getElementById('hwidDisplay');
    const hwid = localStorage.getItem('session_hwid');
    box.classList.toggle('unblurred');
    if (box.classList.contains('unblurred')) {
        navigator.clipboard.writeText(hwid);
        alert("HWID Copied!");
    }
}

async function syncHwid() {
    const input = document.getElementById('newHwid');
    const hwid = input.value.trim();
    if (!hwid) return;

    const payload = { has_access: true, is_banned: false, ban_message: "" };
    const res = await fetch(`${DB_URL}hwid_users/${hwid}.json`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });

    if (res.ok) alert("HWID Registered Successfully.");
}

function logout() {
    localStorage.removeItem('session_hwid');
    window.location.href = "index.html";
}

window.onload = init;
