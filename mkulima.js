let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.role !== "mkulima") {
        alert("Huruhusiwi kuingia hapa bila kuingia kama Mkulima!");
        window.location.href = "utangulizi.html";
        return;
    }

    const display = document.getElementById("farmerNameDisplay");
    if (display) display.textContent = `Karibu, ${currentUser.fullName}`;

    loadAnnouncements();
    loadMarketPrices();
    loadTraderOrders();
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
                <td><b>TZS ${Number(p.price).toLocaleString()}</b></td>
                <td>${p.updatedAt}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Kosa kupakia bei:", err);
    }
}

async function loadTraderOrders() {
    try {
        const res = await fetch('http://localhost:5000/api/orders');
        const orders = await res.json();
        const container = document.getElementById("traderOrdersContainer");
        if (!container) return;
        container.innerHTML = "";

        if (!Array.isArray(orders) || orders.length === 0) {
            container.innerHTML = "<p>Hakuna Oda sokoni kwa sasa.</p>";
            return;
        }

        orders.forEach(o => {
            const card = document.createElement("div");
            card.className = "trader-card";
            card.innerHTML = `
                <span class="badge-order">Oda ID: ${o.id}</span>
                <h3 style="margin-top:10px;">📦 Anatafuta: ${o.cropName}</h3>
                <p><b>Kiasi:</b> ${o.quantityKg} Kg</p>
                <p><b>Bei anayolipa:</b> TZS ${Number(o.offeredPrice).toLocaleString()} / Kg</p>
                <p><b>Mfanyabiashara:</b> ${o.traderName}</p>
                <p><b>Mahali:</b> ${o.location}</p>
                <button onclick="sendFarmerRequest('${o.id}', '${o.traderName}', '${o.cropName}')" class="btn-request">
                    🚗 Tuma Ombi la Kuuza (Request)
                </button>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

async function sendFarmerRequest(orderId, traderName, cropName) {
    if (confirm(`Je, unataka kumtumia ${traderName} ombi la kumuuzia ${cropName}?`)) {
        try {
            const res = await fetch('http://localhost:5000/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    farmerId: currentUser.id,
                    farmerName: currentUser.fullName,
                    farmerContact: currentUser.contact,
                    farmerLocation: currentUser.location,
                    cropName
                })
            });

            if (res.ok) {
                alert(`Ombi lako limetumwa kwa ${traderName}!`);
            }
        } catch (err) {
            console.error(err);
        }
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "utangulizi.html";
}