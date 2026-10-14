// --- ESTADOS Y DATOS INICIALES ---
let currentUser = null;
let currentCrudSub = 'registros'; // registros, materiales, premios

// Base de Datos en Memoria
let db = {
    registros: [
        { material: 'Botellas Plásticas (PET)', cantidad: '10 kg', puntos: 200, fecha: '2026-10-05' },
        { material: 'Cartón y Papel', cantidad: '8.5 kg', puntos: 250, fecha: '2026-10-08' }
    ],
    materiales: [
        { nombre: 'Botellas Plásticas (PET)', puntosKg: 20, descripcion: 'Plásticos limpios de bebidas, envases y tapas.', color: 'emerald' },
        { nombre: 'Cartón y Papel', puntosKg: 15, descripcion: 'Cajas de cartón desarmadas, periódicos y cuadernos.', color: 'amber' },
        { nombre: 'Vidrio', puntosKg: 10, descripcion: 'Botellas y frascos de vidrio sin residuos.', color: 'blue' },
        { nombre: 'Chatarra / Metales', puntosKg: 30, descripcion: 'Latas de aluminio, cobre y pequeños objetos metálicos.', color: 'slate' },
        { nombre: 'Aceite de Cocina Usado', puntosKg: 25, descripcion: 'Aceite vegetal filtrado en botella plástica cerrada.', color: 'yellow' }
    ],
    puntos: [
        { nombre: 'EcoPunto Soacha Centro', direccion: 'Cra. 7 # 13-45, Soacha', horario: 'Lun - Sáb: 8:00 AM - 5:00 PM', estado: 'Abierto' },
        { nombre: 'Punto Verde San Mateo', direccion: 'Calle 30 # 4-20, Soacha', horario: 'Lun - Vie: 9:00 AM - 4:00 PM', estado: 'Abierto' },
        { nombre: 'EcoEstación Bosa', direccion: 'Cl. 65 Sur # 78H-12, Bogotá', horario: 'Todos los días: 7:00 AM - 6:00 PM', estado: 'Abierto' }
    ],
    premios: [
        { id: 1, nombre: 'Balón de Fútbol / Recreación', puntos: 350, stock: 12, img: '⚽' },
        { id: 2, nombre: 'Balón de Baloncesto Económico', puntos: 380, stock: 8, img: '🏀' },
        { id: 3, nombre: 'Tomatodo Ecológico Reutilizable', puntos: 150, stock: 25, img: '🥤' },
        { id: 4, nombre: 'Cuaderno de Papel Reciclado', puntos: 90, stock: 40, img: '📓' },
        { id: 5, nombre: 'Set de 3 Lapiceros Ecológicos', puntos: 60, stock: 50, img: '✏️' }
    ]
};

let userPoints = 450;
let totalKilos = 18.5;
let canjesCount = 2;

// --- AUTENTICACIÓN ---
function switchTab(tab) {
    if(tab === 'login') {
        document.getElementById('form-login').classList.remove('hidden');
        document.getElementById('form-register').classList.add('hidden');
        document.getElementById('tab-login').className = "flex-1 pb-3 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600 transition-colors";
        document.getElementById('tab-register').className = "flex-1 pb-3 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors";
    } else {
        document.getElementById('form-login').classList.add('hidden');
        document.getElementById('form-register').classList.remove('hidden');
        document.getElementById('tab-register').className = "flex-1 pb-3 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600 transition-colors";
        document.getElementById('tab-login').className = "flex-1 pb-3 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors";
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    loginSuccess(email.split('@')[0] || 'Usuario Eco');
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    loginSuccess(name);
}

function quickDemoLogin() {
    loginSuccess('Carlos (Demo)');
}

function loginSuccess(name) {
    currentUser = name;
    document.getElementById('user-name-display').innerText = currentUser;
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    refreshAllViews();
}

function logout() {
    currentUser = null;
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

// --- NAVEGACIÓN ENTRE SECCIONES ---
function switchSection(secId) {
    ['inicio', 'materiales', 'puntos', 'canjes', 'crud'].forEach(s => {
        document.getElementById('sec-' + s).classList.add('hidden');
    });
    document.getElementById('sec-' + secId).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = "nav-btn px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors";
    });
    const activeBtn = document.getElementById('nav-' + secId);
    if(activeBtn) activeBtn.className = "nav-btn px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 bg-emerald-50 transition-colors";

    refreshAllViews();
}

function refreshAllViews() {
    document.getElementById('user-points-display').innerText = userPoints + ' Pts';
    document.getElementById('stat-points').innerText = userPoints + ' Pts';
    document.getElementById('stat-kilos').innerText = totalKilos + ' kg';
    document.getElementById('stat-canjes').innerText = canjesCount;

    renderInicioActivity();
    renderMateriales();
    renderPuntos();
    renderCanjes();
    renderCrudTable();
}


function renderInicioActivity() {
    const tbody = document.getElementById('recent-activity-table');
    tbody.innerHTML = db.registros.map(r => `
        <tr class="hover:bg-slate-50">
            <td class="p-3 font-medium text-slate-800">${r.material}</td>
            <td class="p-3">${r.cantidad}</td>
            <td class="p-3 text-emerald-600 font-semibold">+${r.puntos} Pts</td>
            <td class="p-3 text-slate-400 text-xs">${r.fecha}</td>
        </tr>
    `).join('');
}

function renderMateriales() {
    const query = document.getElementById('search-material').value.toLowerCase();
    const grid = document.getElementById('materiales-grid');
    const filtered = db.materiales.filter(m => m.nombre.toLowerCase().includes(query) || m.descripcion.toLowerCase().includes(query));

    grid.innerHTML = filtered.map(m => `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
                <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                    <i class="fa-solid fa-seedling"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">${m.nombre}</h3>
                <p class="text-xs text-slate-500 mb-4">${m.descripcion}</p>
            </div>
            <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span class="text-xs font-semibold text-slate-400 uppercase">Tarifa</span>
                <span class="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+${m.puntosKg} Pts / kg</span>
            </div>
        </div>
    `).join('');
}

function renderPuntos() {
    const grid = document.getElementById('puntos-grid');
    grid.innerHTML = db.puntos.map(p => `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-3">
                    <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        <i class="fa-solid fa-location-dot"></i>
                    </div>
                    <span class="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">${p.estado}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">${p.nombre}</h3>
                <p class="text-xs text-slate-500 flex items-center mb-2"><i class="fa-solid fa-map-pin mr-1.5 text-slate-400"></i> ${p.direccion}</p>
                <p class="text-xs text-slate-500 flex items-center"><i class="fa-solid fa-clock mr-1.5 text-slate-400"></i> ${p.horario}</p>
            </div>
        </div>
    `).join('');
}

function renderCanjes() {
    const grid = document.getElementById('canjes-grid');
    grid.innerHTML = db.premios.map(p => `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between text-center">
            <div>
                <div class="text-5xl mb-4 py-4 bg-slate-50 rounded-2xl">${p.img}</div>
                <h3 class="text-base font-bold text-slate-900 mb-1">${p.nombre}</h3>
                <p class="text-xs text-slate-400 mb-3">Stock disponible: ${p.stock}</p>
                <div class="text-emerald-700 font-bold text-lg mb-4">${p.puntos} Pts</div>
            </div>
            <button onclick="realizarCanje(${p.id})" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow">
                Canjear Premio
            </button>
        </div>
    `).join('');
}

function realizarCanje(id) {
    const premio = db.premios.find(p => p.id === id);
    if(userPoints >= premio.puntos) {
        if(premio.stock > 0) {
            userPoints -= premio.puntos;
            premio.stock--;
            canjesCount++;
            alert(`¡Canje exitoso! Has adquirido: ${premio.nombre}. Pásate por nuestro punto principal para reclamarlo.`);
            refreshAllViews();
        } else {
            alert('Lo sentimos, este premio se encuentra agotado temporalmente.');
        }
    } else {
        alert('No tienes suficientes puntos acumulados para este premio. ¡Recicla más para alcanzarlos!');
    }
}

// --- GESTIÓN CRUD COMPLETO ---
function setCrudTab(tab) {
    currentCrudSub = tab;
    ['reg', 'mat', 'pre'].forEach(t => {
        document.getElementById('crud-tab-' + t).className = "px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors";
    });
    document.getElementById('crud-tab-' + (tab === 'registros' ? 'reg' : tab === 'materiales' ? 'mat' : 'pre')).className = "px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white transition-colors";
    
    const btnText = tab === 'registros' ? 'Nuevo Registro' : tab === 'materiales' ? 'Nuevo Material' : 'Nuevo Premio';
    document.getElementById('btn-add-text').innerText = btnText;
    renderCrudTable();
}

function renderCrudTable() {
    const head = document.getElementById('crud-table-head');
    const body = document.getElementById('crud-table-body');

    if(currentCrudSub === 'registros') {
        head.innerHTML = `<tr><th class="p-3">Material</th><th class="p-3">Cantidad</th><th class="p-3">Puntos</th><th class="p-3">Fecha</th><th class="p-3 text-right">Acciones</th></tr>`;
        body.innerHTML = db.registros.map((r, i) => `
            <tr class="hover:bg-slate-50">
                <td class="p-3 font-medium text-slate-800">${r.material}</td>
                <td class="p-3">${r.cantidad}</td>
                <td class="p-3 text-emerald-600 font-semibold">+${r.puntos} Pts</td>
                <td class="p-3 text-slate-400 text-xs">${r.fecha}</td>
                <td class="p-3 text-right space-x-2">
                    <button onclick="openModal('edit', ${i})" class="text-blue-500 hover:text-blue-700 text-xs font-semibold"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteItem(${i})" class="text-red-500 hover:text-red-700 text-xs font-semibold"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } else if(currentCrudSub === 'materiales') {
        head.innerHTML = `<tr><th class="p-3">Nombre</th><th class="p-3">Puntos / Kg</th><th class="p-3">Descripción</th><th class="p-3 text-right">Acciones</th></tr>`;
        body.innerHTML = db.materiales.map((m, i) => `
            <tr class="hover:bg-slate-50">
                <td class="p-3 font-medium text-slate-800">${m.nombre}</td>
                <td class="p-3 text-emerald-600 font-semibold">${m.puntosKg} Pts</td>
                <td class="p-3 text-slate-500">${m.descripcion}</td>
                <td class="p-3 text-right space-x-2">
                    <button onclick="openModal('edit', ${i})" class="text-blue-500 hover:text-blue-700 text-xs font-semibold"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteItem(${i})" class="text-red-500 hover:text-red-700 text-xs font-semibold"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } else if(currentCrudSub === 'premios') {
        head.innerHTML = `<tr><th class="p-3">Premio</th><th class="p-3">Puntos Requeridos</th><th class="p-3">Stock</th><th class="p-3 text-right">Acciones</th></tr>`;
        body.innerHTML = db.premios.map((p, i) => `
            <tr class="hover:bg-slate-50">
                <td class="p-3 font-medium text-slate-800">${p.img} ${p.nombre}</td>
                <td class="p-3 text-amber-600 font-semibold">${p.puntos} Pts</td>
                <td class="p-3 text-slate-500">${p.stock} unidades</td>
                <td class="p-3 text-right space-x-2">
                    <button onclick="openModal('edit', ${i})" class="text-blue-500 hover:text-blue-700 text-xs font-semibold"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteItem(${i})" class="text-red-500 hover:text-red-700 text-xs font-semibold"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

// --- MODAL DE CREACIÓN / EDICIÓN ---
function openModal(mode = 'create', index = -1) {
    document.getElementById('crud-modal').classList.remove('hidden');
    document.getElementById('edit-index').value = index;
    const container = document.getElementById('modal-fields');
    const title = document.getElementById('modal-title');

    if(currentCrudSub === 'registros') {
        title.innerText = mode === 'create' ? 'Registrar Nueva Entrega' : 'Editar Registro';
        const item = mode === 'edit' ? db.registros[index] : { material: 'Botellas Plásticas (PET)', cantidad: '', puntos: '' };
        container.innerHTML = `
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Material Reciclado</label>
                <select id="f-material" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    ${db.materiales.map(m => `<option value="${m.nombre}" ${item.material === m.nombre ? 'selected' : ''}>${m.nombre}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Cantidad (Ej: 5 kg)</label>
                <input type="text" id="f-cantidad" required value="${item.cantidad}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Ej: 4 kg">
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Puntos Otorgados</label>
                <input type="number" id="f-puntos" required value="${item.puntos || 100}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="100">
            </div>
        `;
    } else if(currentCrudSub === 'materiales') {
        title.innerText = mode === 'create' ? 'Agregar Nuevo Material' : 'Editar Material';
        const item = mode === 'edit' ? db.materiales[index] : { nombre: '', puntosKg: '', descripcion: '' };
        container.innerHTML = `
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Nombre del Material</label>
                <input type="text" id="f-nombre" required value="${item.nombre}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Ej: Aluminio">
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Puntos por Kilo</label>
                <input type="number" id="f-puntosKg" required value="${item.puntosKg}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="20">
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Descripción</label>
                <input type="text" id="f-descripcion" required value="${item.descripcion}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Breve detalle...">
            </div>
        `;
    } else if(currentCrudSub === 'premios') {
        title.innerText = mode === 'create' ? 'Agregar Nuevo Premio' : 'Editar Premio';
        const item = mode === 'edit' ? db.premios[index] : { nombre: '', puntos: '', stock: '', img: '🎁' };
        container.innerHTML = `
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Nombre del Premio</label>
                <input type="text" id="f-premio-nombre" required value="${item.nombre}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Ej: Balón de Voleibol">
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Puntos Requeridos</label>
                <input type="number" id="f-premio-puntos" required value="${item.puntos}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="300">
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Stock Disponible</label>
                <input type="number" id="f-premio-stock" required value="${item.stock}" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="10">
            </div>
        `;
    }
}

function closeModal() {
    document.getElementById('crud-modal').classList.add('hidden');
}

function handleCrudSubmit(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('edit-index').value);

    if(currentCrudSub === 'registros') {
        const material = document.getElementById('f-material').value;
        const cantidad = document.getElementById('f-cantidad').value;
        const puntos = parseInt(document.getElementById('f-puntos').value);
        const fecha = new Date().toISOString().split('T')[0];

        if(index === -1) {
            db.registros.unshift({ material, cantidad, puntos, fecha });
            userPoints += puntos;
            totalKilos += parseFloat(cantidad) || 2;
        } else {
            db.registros[index] = { material, cantidad, puntos, fecha: db.registros[index].fecha };
        }
    } else if(currentCrudSub === 'materiales') {
        const nombre = document.getElementById('f-nombre').value;
        const puntosKg = parseInt(document.getElementById('f-puntosKg').value);
        const descripcion = document.getElementById('f-descripcion').value;

        if(index === -1) {
            db.materiales.push({ nombre, puntosKg, descripcion });
        } else {
            db.materiales[index] = { nombre, puntosKg, descripcion };
        }
    } else if(currentCrudSub === 'premios') {
        const nombre = document.getElementById('f-premio-nombre').value;
        const puntos = parseInt(document.getElementById('f-premio-puntos').value);
        const stock = parseInt(document.getElementById('f-premio-stock').value);

        if(index === -1) {
            db.premios.push({ id: Date.now(), nombre, puntos, stock, img: '🎁' });
        } else {
            db.premios[index] = { ...db.premios[index], nombre, puntos, stock };
        }
    }

    closeModal();
    refreshAllViews();
}

function deleteItem(index) {
    if(confirm('¿Estás seguro de eliminar este elemento?')) {
        if(currentCrudSub === 'registros') db.registros.splice(index, 1);
        else if(currentCrudSub === 'materiales') db.materiales.splice(index, 1);
        else if(currentCrudSub === 'premios') db.premios.splice(index, 1);
        refreshAllViews();
    }
}