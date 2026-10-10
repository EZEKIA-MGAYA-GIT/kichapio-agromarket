// Kazi inayofungua modal (dirisha dogo la fomu) kwa kutumia ID yake
function openModal(id) {
    // Inabadilisha style ya CSS display kuwa 'flex' ili modal ionekane katikati ya screen
    document.getElementById(id).style.display = 'flex';
}

// Kazi inayofunga modal kwa kutumia ID yake
function closeModal(id) {
    // Inabadilisha style ya CSS display kuwa 'none' ili kuitokomeza modal kwenye screen
    document.getElementById(id).style.display = 'none';
}

// Kazi inayokagua kama password inakidhi vigezo vya usalama
function validatePassword(password) {
    // Inakagua kama kuna angalau herufi moja (A-Z au a-z)
    const hasLetters = /[a-zA-Z]/.test(password);
    // Inakagua kama kuna angalau namba moja (0-9)
    const hasNumbers = /[0-9]/.test(password);
    // Inakagua kama kuna alama maalumu (mfano: @, #, $, na nyinginezo)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    // Inarudisha true ikiwa vigezo vyote vitatu vimetimia, vinginevyo inarudisha false
    return hasLetters && hasNumbers && hasSpecialChar;
}

// Kazi inayotawala mchakato wa usajili (Register) wakati fomu inapowasilishwa
async function handleRegister(event) {
    // Inazuia ukurasa kujirefresh/kureload pindi fomu inapobonyezwa
    event.preventDefault();

    // Inachukua na kusafisha nafasi zilizo wazi (trim) kwenye jina kamili
    const fullName = document.getElementById('regFullName').value.trim();
    // Inachukua na kusafisha taarifa za mawasiliano (email/namba ya simu)
    const contact = document.getElementById('regContact').value.trim();
    // Inachukua na kusafisha namba ya NIDA
    const nida = document.getElementById('regNida').value.trim();
    // Inachukua na kusafisha eneo/mahali mtumiaji anapokaa
    const location = document.getElementById('regLocation').value.trim();
    // Inachukua aina ya akaunti iliyochaguliwa (mkulima au mfanyabiashara)
    const role = document.getElementById('regRole').value;
    // Inachukua na kusafisha password iliyoingizwa
    const password = document.getElementById('regPassword').value.trim();

    // Inakagua kama mtumiaji amechagua aina ya akaunti
    if (!role) {
        // Inamuonyesha mtumiaji taarifa ya kuchagua akaunti
        alert("Tafadhali chagua Aina ya Akaunti!");
        // Inasitisha kuendelea kwa mchakato
        return;
    }

    // Inakagua kama password haina vigezo vinavyotakiwa kwa kutumia kazi ya validatePassword
    if (!validatePassword(password)) {
        // Inamuonyesha mtumiaji alert yenye maelekezo ya vigezo vya password
        alert("Nenosiri (Password) lazima liwe na mchanganyiko wa Herufi, Namba, na Alama maalumu (mfano: @, #, $)");
        // Inasitisha kuendelea kwa mchakato
        return;
    }

    // Inaanza sehemu ya kujaribu kuunganisha na server
    try {
        // Inatuma maombi ya POST kwenda kwenye API endpoint ya usajili kwenye Node.js backend
        const response = await fetch('http://localhost:5000/api/register', {
            // Inabainisha njia ya mawasiliano kuwa ni POST
            method: 'POST',
            // Inataarifu server kuwa data inayotumwa ni za mfumo wa JSON
            headers: { 'Content-Type': 'application/json' },
            // Inabadilisha object ya JS kuwa string ya JSON ili kutuma kwenye server
            body: JSON.stringify({ fullName, contact, nida, location, role, password })
        });

        // Inabadilisha jibu lililotoka kwenye server kutoka JSON kuwa JS Object
        const data = await response.json();

        // Inakagua kama server imerudisha majibu ya mafanikio (Status 200-299)
        if (response.ok) {
            // Inamuonyesha mtumiaji ujumbe wa mafanikio
            alert("Usajili umefanikiwa! Sasa unaweza kulogin.");
            // Inafunga modal ya usajili
            closeModal('registerModal');
            // Inafungua modal ya kuingia (login)
            openModal('loginModal');
        } else {
            // Inatokeza alert na ujumbe wa kosa uliorudishwa na server
            alert("Imeshindikana: " + (data.error || "Kosa halijajulikana"));
        }
    } catch (err) {
        // Inaandika kosa kwenye Developer Console kwa ajili ya debugging
        console.error("Register Error:", err);
        // Inatokeza alert pindi server inapokuwa haipatikani au imezimwa
        alert("Haikuweza kuunganisha na Server! Hakikisha Node.js (node server.js) inafanya kazi.");
    }
}

// Kazi inayotawala mchakato wa kuingia kwenye mfumo (Login)
async function handleLogin(event) {
    // Inazuia ukurasa kujirefresh/kureload wakati button ya submit inapobonyezwa
    event.preventDefault();

    // Inachukua na kusafisha thamani ya username/email/simu kutoka kwenye input
    const username = document.getElementById('loginUser').value.trim();
    // Inachukua na kusafisha thamani ya password kutoka kwenye input
    const password = document.getElementById('loginPassword').value.trim();
    // Inachukua aina ya mtumiaji aliyetaka kuingia nayo (admin, mkulima, mfanyabiashara)
    const role = document.getElementById('loginRole').value;
    // Inakamata element ya button ya login ili kuibadilisha muonekano wakati wa kutuma data
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Inakagua kama mtumiaji hajajaza username au password
    if (!username || !password) {
        // Inatoa alert kumtaka mtumiaji ajaze nafasi zote
        alert("Tafadhali jaza Username na Password!");
        // Inasitisha mchakato
        return;
    }

    // Inakagua kama mtumiaji hajadhibitisha role yake
    if (!role) {
        // Inatoa alert kumtaka mtumiaji achague Role
        alert("Tafadhali chagua Aina ya Mtumiaji (Ingia Kama)!");
        // Inasitisha mchakato
        return;
    }

    // Inaanza kujaribu kuunganisha na Backend API
    try {
        // Inalemaza button ya login ili kuzuia mtumiaji kuisukuma mara nyingi
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Inaingia...";
        }

        // Inatuma maombi ya POST kwenda kwenye API ya Login
        const response = await fetch('http://localhost:5000/api/login', {
            // Njia ya maombi ni POST
            method: 'POST',
            // Aina ya data ni Application/JSON
            headers: { 'Content-Type': 'application/json' },
            // Inatuma data za login zikiwa kwenye mfumo wa String ya JSON
            body: JSON.stringify({ username, password, role })
        });

        // Inasoma na kubadilisha jibu la server kutoka JSON kwenda JS Object
        const data = await response.json();

        // Inakagua ikiwa majibu ya server ni ya mafanikio (Status OK)
        if (response.ok) {
            // Inahifadhi taarifa za mtumiaji aliyefanikiwa kuingia kwenye LocalStorage ya kivinjari
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            // SEHEMU YA INAYOELEKEZA KIKOSI KULINGANA NA ROLE:
            // Ikiwa role ni 'admin'
            if (role === 'admin') {
                // Inamhamisha mtumiaji moja kwa moja hadi ukurasa wa admin.html
                window.location.href = 'admin.html';
            } 
            // Ikiwa role ni 'mkulima'
            else if (role === 'mkulima') {
                // Inamhamisha mtumiaji hadi ukurasa wa mkulima.html
                window.location.href = 'mkulima.html';
            } 
            // Ikiwa role ni 'mfanyabiashara'
            else if (role === 'mfanyabiashara') {
                // Inamhamisha mtumiaji hadi ukurasa wa mfanyabiashara.html
                window.location.href = 'mfanyabiashara.html';
            }
        } else {
            // Inatoa alert ikiwa login imekataliwa na server (mfano: Password sio sahihi)
            alert("Kosa: " + (data.error || "Taarifa ulizoingiza sio sahihi."));
        }
    } catch (err) {
        // Inaandika kosa kwenye console ikiwa jaribio limeshindikana
        console.error("Login Error:", err);
        // Inatoa alert kuarifu mtumiaji kwamba server haipatikani
        alert("Haikuweza kuunganisha na Server! Hakikisha node server.js inafanya kazi.");
    } finally {
        // Inarudisha button kwenye hali yake ya kawaida mara baada ya server kujibu
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Ingia";
        }
    }
} 