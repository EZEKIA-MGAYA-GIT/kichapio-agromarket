let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "mfanyabiashara") {
        alert("Huruhusiwi kuingia hapa bila kuingia kama Mfanyabiashara!");
        window.location.href = "utangulizi.html";
        return;
    }

    const display = document.getElementById("traderNameDisplay");
    if (display) display.textContent = `Karibu, ${currentUser.fullName}`;

    loadAnnouncements();
    loadMarketPrices();
    loadMyOrders();
    loadFarmerRequests();
});

async function loadAnnouncements() {
    try {
        const res = await fetch('http://localhost:5000/api/announcements');
        const announcements = await res.json();
        const container = document.getElementById("announcementsList");

        if (!container) return;

        if (!Array.isArray(announcements) || announcements.length === 0) {
            container.innerHTML = "<p style='color:#777;'>Hakuna ujumbe mpya kutoka kwa Admin.</p>";
            return;
        }

        container.innerHTML = "";
        announcements.forEach(item => {
            const div = document.createElement("div");
            div.className = "announcement-item";
            div.innerHTML = `
                <h4>📢 ${item.title}</h4>
                <p>${item.body || item.message}</p>
                <small>⏰ Imetumwa: ${item.date || 'Hivi karibuni'}</small>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error("Kosa kupakia matangazo:", err);
    }
}

async function loadMarketPrices() {
    try {
        const res = await fetch('http://localhost:5000/api/prices');
        const prices = await res.json();
        const tbody = document.getElementById("marketPricesBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (!Array.isArray(prices)) return;

        prices.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><b>${p.cropName}</b></td>
                <td>${p.location}</td>
                <td>TZS ${Number(p.price).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function createOrder(event) {
    if (event) event.preventDefault();

    const cropName = document.getElementById("orderCropName").value.trim();
    const quantityKg = document.getElementById("orderQuantity").value;
    const offeredPrice = document.getElementById("orderPrice").value;
    const location = document.getElementById("orderLocation").value.trim();

    try {
        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                traderId: currentUser.id,
                traderName: currentUser.fullName,
                traderContact: currentUser.contact,
                cropName,
                quantityKg,
                offeredPrice,
                location
            })
        });

        if (res.ok) {
            alert("Oda imewekwa sokoni kikamilifu!");
            document.getElementById("orderCropName").value = "";
            document.getElementById("orderQuantity").value = "";
            document.getElementById("orderPrice").value = "";
            document.getElementById("orderLocation").value = "";
            loadMyOrders();
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadMyOrders() {
    try {
        const res = await fetch('http://localhost:5000/api/orders');
        const orders = await res.json();

        if (!Array.isArray(orders)) return;
        const myOrders = orders.filter(o => o.traderId === currentUser.id);

        const tbody = document.getElementById("myOrdersTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (myOrders.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Bado hujaweka oda yoyote sokoni.</td></tr>";
            return;
        }

        myOrders.forEach(o => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${o.id}</td>
                <td><b>${o.cropName}</b></td>
                <td>${Number(o.quantityKg).toLocaleString()} Kg</td>
                <td>TZS ${Number(o.offeredPrice).toLocaleString()}</td>
                <td>${o.location}</td>
                <td>---</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadFarmerRequests() {
    try {
        const res = await fetch('http://localhost:5000/api/requests');
        const requests = await res.json();
        const container = document.getElementById("farmerRequestsContainer");
        if (!container) return;
        container.innerHTML = "";

        if (!Array.isArray(requests) || requests.length === 0) {
            container.innerHTML = "<p>Bado hakuna Mkulima aliyetuma ombi la kukuuzia mazao.</p>";
            return;
        }

        requests.forEach(r => {
            const isAccepted = r.status === "Imekubaliwa (Accepted)";
            const statusClass = isAccepted ? "badge-status badge-accepted" : "badge-status";

            const card = document.createElement("div");
            card.className = "request-card";
            card.innerHTML = `
                <h3>👨‍🌾 Ombi la Kuuza: ${r.cropName}</h3>
                <p><b>Mkulima:</b> ${r.farmerName}</p>
                <p><b>Mawasiliano:</b> ${r.farmerContact}</p>
                <p><b>Mahali Alipo:</b> ${r.farmerLocation}</p>
                <p><b>Hali ya Ombi:</b> <span class="${statusClass}">${r.status}</span></p>

                ${!isAccepted ? `
                    <button onclick="acceptFarmerRequest('${r.id}', '${r.farmerName}', '${r.farmerContact}')" class="btn-accept">
                        ✅ Kubali Ombi & Ongea na Mkulima
                    </button>
                ` : `
                    <p style="color:#2e7d32; font-weight:bold; margin-top:10px;">
                        📞 Mpigie Mkulima Hapa: ${r.farmerContact}
                    </p>
                `}
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

async function acceptFarmerRequest(requestId, farmerName, farmerContact) {
    try {
        const res = await fetch(`http://localhost:5000/api/requests/${requestId}/accept`, { method: 'PUT' });
        if (res.ok) {
            alert(`Umekubali ombi la ${farmerName}! Mawasiliano: ${farmerContact}`);
            loadFarmerRequests();
        }
    } catch (err) {
        console.error(err);
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "utangulizi.html";
}