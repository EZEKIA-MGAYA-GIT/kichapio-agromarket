const API_URL = "http://localhost:5000/api";
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

document.addEventListener("DOMContentLoaded", () => {
    loadProductsFromDB();
    checkUserSession();
});

function showLogin() { 
    document.getElementById("loginModal").style.display = "flex"; 
}

function showRegister() { 
    document.getElementById("registerModal").style.display = "flex"; 
}

function closeModal(id) { 
    document.getElementById(id).style.display = "none"; 
}

window.onclick = function(event) {
    if (event.target.classList.contains("modal")) {
        event.target.style.display = "none";
    }
};

// ================= REGISTER =================
async function register(event) {
    event.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole").value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            closeModal("registerModal");
            showLogin(); // Inafungua Modal ya Login mara moja baada ya usajili
        } else {
            alert("Kosa: " + data.error);
        }
    } catch (err) {
        alert("Server haipatikani! Hakikisha node server.js inaenda.");
    }
}

// ================= LOGIN =================
async function login(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const role = document.getElementById("loginRole").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role })
        });
        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem("user", JSON.stringify(currentUser));
            alert(`Karibu ${currentUser.full_name}!`);
            closeModal("loginModal");
            
            // Kazi hii inafungua Dashboard na kubadilisha bar ya juu
            checkUserSession(); 
        } else {
            alert("Kosa: " + data.error);
        }
    } catch (err) {
        alert("Server haipatikani! Hakikisha node server.js inaenda.");
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("user");
    currentUser = null;
    alert("Umetoka kwenye mfumo.");
    window.location.reload();
}

// ================= CHECK SESSION & SHOW DASHBOARD =================
function checkUserSession() {
    const navButtons = document.querySelector(".nav-buttons");
    const dashboardSection = document.getElementById("dashboardSection");

    if (currentUser) {
        navButtons.innerHTML = `
            <span>Habari, <b>${currentUser.full_name}</b> (${currentUser.role})</span>
            <button onclick="logout()" style="background:#cc0000; color:white; margin-left:10px;">Logout</button>
        `;
        if (dashboardSection) {
            dashboardSection.style.display = "block";
            renderDashboard();
            dashboardSection.scrollIntoView({ behavior: "smooth" });
        }
    } else {
        if (dashboardSection) {
            dashboardSection.style.display = "none";
        }
    }
}

// ================= RENDER DASHBOARD =================
function renderDashboard() {
    const container = document.getElementById("dashboardContent");
    if (!container) return;
    
    if (currentUser.role === "farmer") {
        container.innerHTML = `
            <h3>👨‍🌾 Dashboard ya Mkulima</h3>
            <div style="background:#f4f4f4; padding:20px; border-radius:8px; margin-top:10px;">
                <h4>Weka Zao Jipya Sokoni</h4>
                <form onsubmit="addProduct(event)">
                    <input type="text" id="cropName" placeholder="Jina la Zao (Mfano: Mahindi)" required style="width:100%; margin:8px 0; padding:10px;">
                    <input type="text" id="cropLocation" placeholder="Mahali (Location)" required style="width:100%; margin:8px 0; padding:10px;">
                    <input type="number" id="cropPrice" placeholder="Bei kwa Kg (TZS)" required style="width:100%; margin:8px 0; padding:10px;">
                    <input type="text" id="cropEmoji" placeholder="Emoji (Mfano: 🌽)" style="width:100%; margin:8px 0; padding:10px;">
                    <button type="submit" style="background:#176b35; color:white; padding:12px; width:100%; border:none; margin-top:10px; cursor:pointer; font-weight:bold;">Ongeza Zao Sokoni</button>
                </form>
            </div>
        `;
    } else if (currentUser.role === "trader") {
        container.innerHTML = `
            <h3>👨‍💼 Dashboard ya Mfanyabiashara</h3>
            <p>Akaunti yako ipo tayari! Unaweza kuchagua zao lolote hapo chini kwenye orodha ili kuweka Oda (Order) yako.</p>
        `;
    } else if (currentUser.role === "admin") {
        loadAdminData();
    }
}

// ================= MKULIMA: ADD PRODUCT =================
async function addProduct(e) {
    e.preventDefault();
    const crop_name = document.getElementById("cropName").value;
    const location = document.getElementById("cropLocation").value;
    const price_per_kg = document.getElementById("cropPrice").value;
    const image_emoji = document.getElementById("cropEmoji").value;

    const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            farmer_id: currentUser.id,
            crop_name,
            farmer_name: currentUser.full_name,
            location,
            price_per_kg,
            image_emoji
        })
    });
    if (res.ok) {
        alert("Zao limeongezwa kikamilifu!");
        loadProductsFromDB();
    }
}

// ================= LOAD PRODUCTS =================
async function loadProductsFromDB() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        const container = document.getElementById("productContainer");
        if (!container) return;
        container.innerHTML = "";

        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <div class="product-image">${p.image_emoji || '🌾'}</div>
                <h3>${p.crop_name}</h3>
                <p>Mkulima: ${p.farmer_name}</p>
                <p>Location: ${p.location}</p>
                <h4>TZS ${Number(p.price_per_kg).toLocaleString()} / Kg</h4>
                <button onclick="placeOrder(${p.id}, '${p.crop_name}', ${p.price_per_kg})">Weka Oda / Nunua</button>
            `;
            container.appendChild(card);
        });
    } catch (err) { console.log(err); }
}

// ================= TRADER: PLACE ORDER =================
async function placeOrder(productId, cropName, price) {
    if (!currentUser || currentUser.role !== "trader") {
        alert("Tafadhali ingia kama Mfanyabiashara (Trader) ili kuweka oda!");
        return;
    }
    const qty = prompt(`Weka Idadi ya Kilogram (Kg) za ${cropName} unazotaka:`);
    if (!qty || isNaN(qty)) return;

    const total = qty * price;
    const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            trader_id: currentUser.id,
            product_id: productId,
            crop_name: cropName,
            quantity_kg: qty,
            total_price: total
        })
    });
    if (res.ok) alert(`Oda yako ya Kg ${qty} za ${cropName} kwa TZS ${total.toLocaleString()} imetumwa!`);
}

// ================= ADMIN DATA =================
async function loadAdminData() {
    const container = document.getElementById("dashboardContent");
    const [usersRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`),
        fetch(`${API_URL}/admin/orders`)
    ]);
    const users = await usersRes.json();
    const orders = await ordersRes.json();

    container.innerHTML = `
        <h3>⚙️ Admin Panel</h3>
        <div style="display:flex; gap:15px; margin:15px 0;">
            <div style="background:#176b35; color:white; padding:15px; flex:1; text-align:center; border-radius:8px;">
                <h2>${users.length}</h2>
                <p>Jumla ya Members</p>
            </div>
            <div style="background:#0e4c24; color:white; padding:15px; flex:1; text-align:center; border-radius:8px;">
                <h2>${orders.length}</h2>
                <p>Jumla ya Oda</p>
            </div>
        </div>

        <h4>Orodha ya Members Waliojisajili</h4>
        <div style="overflow-x:auto;">
            <table border="1" style="width:100%; margin-bottom:20px; border-collapse:collapse;">
                <tr style="background:#176b35; color:white;"><th>ID</th><th>Jina</th><th>Email</th><th>Role</th></tr>
                ${users.map(u => `<tr><td>${u.id}</td><td>${u.full_name}</td><td>${u.email}</td><td>${u.role}</td></tr>`).join('')}
            </table>
        </div>

        <h4>Orodha ya Oda Zilizofanywa</h4>
        <div style="overflow-x:auto;">
            <table border="1" style="width:100%; margin-bottom:20px; border-collapse:collapse;">
                <tr style="background:#176b35; color:white;"><th>Oda ID</th><th>Zao</th><th>Kiasi (Kg)</th><th>Jumla (TZS)</th></tr>
                ${orders.map(o => `<tr><td>${o.id}</td><td>${o.crop_name}</td><td>${o.quantity_kg}</td><td>${o.total_price}</td></tr>`).join('')}
            </table>
        </div>
    `;
}

function searchProducts() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const products = document.querySelectorAll(".product-card");
    products.forEach(function(product) {
        const productName = product.querySelector("h3").textContent.toLowerCase();
        if (productName.includes(search)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}

function showMessage() { alert("Maelezo ya tangazo yataonekana hapa."); }
function scrollToProducts() { document.getElementById("products").scrollIntoView({ behavior: "smooth" }); }