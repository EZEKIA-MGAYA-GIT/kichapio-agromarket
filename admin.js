document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "admin") {
        alert("Huruhusiwi kuingia bila kuingia kama Admin!");
        window.location.href = "utangulizi.html";
        return;
    }

    const displayElem = document.getElementById("adminNameDisplay");
    if (displayElem) displayElem.textContent = `Karibu, ${currentUser.fullName}`;

    loadAdminDashboard();
});

async function loadAdminDashboard() {
    await fetchUsers();
    await fetchPrices();
}

async function fetchUsers() {
    try {
        const res = await fetch('http://localhost:5000/api/users');
        const users = await res.json();

        if (!Array.isArray(users)) return;

        const farmers = users.filter(u => u.role === "mkulima");
        const traders = users.filter(u => u.role === "mfanyabiashara");

        if (document.getElementById("totalUsersCount")) document.getElementById("totalUsersCount").textContent = users.length;
        if (document.getElementById("totalFarmersCount")) document.getElementById("totalFarmersCount").textContent = farmers.length;
        if (document.getElementById("totalTradersCount")) document.getElementById("totalTradersCount").textContent = traders.length;

        const tbody = document.getElementById("usersTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Hakuna member aliyejisajili bado.</td></tr>`;
            return;
        }

        users.forEach(u => {
            const badgeClass = u.role === "mkulima" ? "badge-farmer" : "badge-trader";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.id}</td>
                <td><b>${u.fullName}</b></td>
                <td>${u.nida || 'N/A'}</td>
                <td>${u.contact}</td>
                <td>${u.location}</td>
                <td><span class="${badgeClass}">${u.role.toUpperCase()}</span></td>
                <td>
                    <button onclick="removeUser('${u.id}')" class="btn-delete">Mtoe Member</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error ikitafuta Users:", err);
    }
}

async function removeUser(userId) {
    if (confirm("Je, una uhakika unataka kumuondoa member huyu?")) {
        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Member ameondolewa!");
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
        }
    }
}

async function postAnnouncement(event) {
    if (event) event.preventDefault();
    const title = document.getElementById("msgTitle").value.trim();
    const body = document.getElementById("msgBody").value.trim();

    try {
        const res = await fetch('http://localhost:5000/api/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body })
        });

        if (res.ok) {
            alert("Ujumbe umetumwa!");
            document.getElementById("msgTitle").value = "";
            document.getElementById("msgBody").value = "";
        }
    } catch (err) {
        console.error(err);
    }
}

async function updateCropPrice(event) {
    if (event) event.preventDefault();
    const cropName = document.getElementById("cropName").value.trim();
    const location = document.getElementById("cropLocation").value.trim();
    const price = document.getElementById("cropPrice").value;

    try {
        const res = await fetch('http://localhost:5000/api/prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cropName, location, price })
        });

        if (res.ok) {
            alert("Bei imesasishwa!");
            document.getElementById("cropName").value = "";
            document.getElementById("cropLocation").value = "";
            document.getElementById("cropPrice").value = "";
            fetchPrices();
        }
    } catch (err) {
        console.error(err);
    }
}

async function fetchPrices() {
    try {
        const res = await fetch('http://localhost:5000/api/prices');
        const prices = await res.json();

        const tbody = document.getElementById("pricesTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (!Array.isArray(prices)) return;

        prices.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><b>${p.cropName}</b></td>
                <td>${p.location}</td>
                <td>TZS ${Number(p.price).toLocaleString()}</td>
                <td>${p.updatedAt}</td>
                <td>---</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "utangulizi.html";
}