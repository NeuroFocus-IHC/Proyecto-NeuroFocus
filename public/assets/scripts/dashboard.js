let historialNavegacion = [];

function navegarA(idDestino) {
    const vistaActual = document.querySelector('.view.active');
    
    // Solo agregar al historial si estamos yendo a una pantalla diferente y no es un "retroceso" manual.
    // Para simplificar, asumiremos que todas las navegaciones normales avanzan, y retroceder() manejará el historial.
    if (vistaActual && vistaActual.id !== idDestino) {
        historialNavegacion.push(vistaActual.id);
    }

    const vistas = document.querySelectorAll('.view');
    vistas.forEach(vista => {
        vista.classList.remove('active');
    });

    const vistaDestino = document.getElementById(idDestino);
    if (vistaDestino) {
        vistaDestino.classList.add('active');
        window.scrollTo(0, 0); 
    }
}

function retroceder() {
    if (historialNavegacion.length > 0) {
        const vistaAnterior = historialNavegacion.pop();
        
        const vistas = document.querySelectorAll('.view');
        vistas.forEach(vista => vista.classList.remove('active'));
        
        const vistaDestino = document.getElementById(vistaAnterior);
        if (vistaDestino) {
            vistaDestino.classList.add('active');
            window.scrollTo(0, 0);
        }
    } else {
        // Fallback: si no hay historial (e.g., recargó la página), ir a login
        navegarA('pantalla-login');
        historialNavegacion = []; // clear the push that just happened
    }
}

let temporizadorInterval;
let segundosTranscurridos = 0;
let keyPressTimestamps = [];
let enPausaTrasAlerta = false;
let tiempoDesdeUltimaAlerta = 0;
let esPausaManual = false;

let descansoInterval;
let segundosDescanso = 0;

function iniciarTemporizador() {
    if (!enPausaTrasAlerta) {
        segundosTranscurridos = 0;
        keyPressTimestamps = [];
        tiempoDesdeUltimaAlerta = 0;
        esPausaManual = false;
        const btn = document.getElementById('btn-pausar-tarea');
        if (btn) {
            let currentLang = localStorage.getItem('lang') || 'es';
            btn.textContent = window.translations && window.translations[currentLang] && window.translations[currentLang]['dash_pausar'] 
                ? window.translations[currentLang]['dash_pausar'] 
                : (currentLang === 'en' ? 'PAUSE NOW' : 'PAUSAR AHORA');
        }
        resetearEstadoConcentracion();
    }
    
    actualizarVistaTemporizador();
    document.addEventListener('keydown', calcularVelocidadTecleo);
    
    temporizadorInterval = setInterval(() => {
        segundosTranscurridos++;
        
        if (enPausaTrasAlerta) {
            tiempoDesdeUltimaAlerta++;
        }
        
        actualizarVistaTemporizador();
        
        let concentracion = Math.max(100 - (segundosTranscurridos * 5), 0);
        
        document.getElementById('concentration-percentage').innerText = concentracion + '%';
        document.getElementById('concentration-bar').style.width = concentracion + '%';

        if (concentracion <= 50 && !enPausaTrasAlerta) {
            detenerTemporizador();
            cambiarEstadoConcentracionAmarillo();
            document.getElementById('alert-nivel-actual').innerText = concentracion + '%';
            enPausaTrasAlerta = true;
            navegarAOriginal('pantalla-alerta');
        } else if (enPausaTrasAlerta && tiempoDesdeUltimaAlerta >= 5) {
            detenerTemporizador();
            document.getElementById('alert-nivel-actual').innerText = concentracion + '%';
            tiempoDesdeUltimaAlerta = 0;
            navegarAOriginal('pantalla-alerta');
        }
    }, 1000);
}

function reanudarTemporizador() {
    document.addEventListener('keydown', calcularVelocidadTecleo);
    temporizadorInterval = setInterval(() => {
        segundosTranscurridos++;
        
        if (enPausaTrasAlerta) {
            tiempoDesdeUltimaAlerta++;
        }
        
        actualizarVistaTemporizador();
        
        let concentracion = Math.max(100 - (segundosTranscurridos * 5), 0);
        
        document.getElementById('concentration-percentage').innerText = concentracion + '%';
        document.getElementById('concentration-bar').style.width = concentracion + '%';

        if (concentracion <= 50 && !enPausaTrasAlerta) {
            detenerTemporizador();
            cambiarEstadoConcentracionAmarillo();
            document.getElementById('alert-nivel-actual').innerText = concentracion + '%';
            enPausaTrasAlerta = true;
            navegarAOriginal('pantalla-alerta');
        } else if (enPausaTrasAlerta && tiempoDesdeUltimaAlerta >= 5) {
            detenerTemporizador();
            document.getElementById('alert-nivel-actual').innerText = concentracion + '%';
            tiempoDesdeUltimaAlerta = 0;
            navegarAOriginal('pantalla-alerta');
        }
    }, 1000);
}

function togglePausaTarea() {
    const btn = document.getElementById('btn-pausar-tarea');
    if (!btn) return;
    
    let currentLang = localStorage.getItem('lang') || 'es';
    
    if (esPausaManual) {
        esPausaManual = false;
        const textoOriginal = window.translations && window.translations[currentLang] && window.translations[currentLang]['dash_pausar'] 
            ? window.translations[currentLang]['dash_pausar'] 
            : (currentLang === 'en' ? 'PAUSE NOW' : 'PAUSAR AHORA');
        btn.textContent = textoOriginal;
        reanudarTemporizador();
    } else {
        esPausaManual = true;
        detenerTemporizador();
        const textoPausa = window.translations && window.translations[currentLang] && window.translations[currentLang]['dash_reanudar'] 
            ? window.translations[currentLang]['dash_reanudar'] 
            : (currentLang === 'en' ? 'RESUME TASK' : 'REANUDAR TAREA');
        btn.textContent = textoPausa;
    }
}

function detenerTemporizador() {
    clearInterval(temporizadorInterval);
    document.removeEventListener('keydown', calcularVelocidadTecleo);
}

function actualizarVistaTemporizador() {
    const horas = Math.floor(segundosTranscurridos / 3600);
    const minutos = Math.floor((segundosTranscurridos % 3600) / 60);
    const segundos = segundosTranscurridos % 60;
    
    const formato = [horas, minutos, segundos]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
        
    document.getElementById('timer-display').innerText = formato;
}

function cambiarEstadoConcentracionAmarillo() {
    const dot = document.getElementById('concentration-dot');
    const text = document.getElementById('concentration-text');
    
    dot.classList.remove('optimal');
    dot.classList.add('bg-warning-amber');
    text.classList.add('text-warning-amber');
}

function resetearEstadoConcentracion() {
    const dot = document.getElementById('concentration-dot');
    const text = document.getElementById('concentration-text');
    
    dot.classList.add('optimal');
    dot.classList.remove('bg-warning-amber');
    text.classList.remove('text-warning-amber');
    
    document.getElementById('concentration-percentage').innerText = '100%';
    document.getElementById('concentration-bar').style.width = '100%';
    
    document.getElementById('kpm-display').innerText = '0 kpm';
    document.getElementById('kpm-bar').style.width = '0%';
}

function calcularVelocidadTecleo(evento) {
    const ahora = Date.now();
    keyPressTimestamps.push(ahora);
    
    if (keyPressTimestamps.length > 10) {
        keyPressTimestamps.shift();
    }
    
    if (keyPressTimestamps.length > 1) {
        const primerToque = keyPressTimestamps[0];
        const ultimoToque = keyPressTimestamps[keyPressTimestamps.length - 1];
        const diferenciaMinutos = (ultimoToque - primerToque) / 60000;
        
        if (diferenciaMinutos > 0) {
            const kpm = Math.round((keyPressTimestamps.length - 1) / diferenciaMinutos);
            document.getElementById('kpm-display').innerText = kpm + ' kpm';
            
            const anchoBarra = Math.min((kpm / 300) * 100, 100);
            document.getElementById('kpm-bar').style.width = anchoBarra + '%';
        }
    }
}

function iniciarDescanso() {
    segundosDescanso = 0;
    actualizarVistaDescanso();
    
    descansoInterval = setInterval(() => {
        segundosDescanso++;
        actualizarVistaDescanso();
        
        if (segundosDescanso >= 600) {
            detenerDescanso();
            navegarAOriginal('pantalla-tarea');
        }
    }, 1000);
}

function detenerDescanso() {
    clearInterval(descansoInterval);
}

function actualizarVistaDescanso() {
    const minutos = Math.floor(segundosDescanso / 60);
    const segundos = segundosDescanso % 60;
    
    const formato = [minutos, segundos]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
        
    document.getElementById('break-timer-display').innerText = formato;
}

const navegarAOriginal = navegarA;
navegarA = function(idDestino) {
    if (typeof detenerTemporizador === 'function') {
        detenerTemporizador();
    }
    if (typeof detenerDescanso === 'function') {
        detenerDescanso();
    }
    
    if (idDestino === 'pantalla-dashboard' || idDestino === 'pantalla-descanso') {
        enPausaTrasAlerta = false; 
        tiempoDesdeUltimaAlerta = 0;
    }
    
    navegarAOriginal(idDestino);

    if (idDestino === 'pantalla-tarea') {
        iniciarTemporizador();
    } else if (idDestino === 'pantalla-descanso') {
        iniciarDescanso();
    }
}

function agregarPadre(event) {
    event.preventDefault();
    
    const nombreInput = document.getElementById('padre-nombre');
    const correoInput = document.getElementById('padre-correo');
    const nombre = nombreInput.value.trim();
    
    if (nombre !== "") {
        const lista = document.getElementById('lista-padres');
        const noPadresMsg = document.getElementById('no-padres-msg');
        
        if (noPadresMsg) {
            noPadresMsg.remove();
        }
        
        const nuevoPadre = document.createElement('li');
        nuevoPadre.innerText = nombre;
        nuevoPadre.classList.add('mb-1');
        
        lista.appendChild(nuevoPadre);
        
        nombreInput.value = '';
        correoInput.value = '';
    }
}

let hijosRegistrados = [];

function agregarHijo() {
    const nombreInput = document.getElementById('hijo-nombre');
    const correoInput = document.getElementById('hijo-correo');
    const edadInput = document.getElementById('hijo-edad');
    const gradoInput = document.querySelector('input[name="grado-hijo"]:checked');

    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const edad = edadInput.value.trim();

    if (nombre !== "" && correo !== "" && edad !== "" && gradoInput) {
        
        hijosRegistrados.push({
            nombre: nombre,
            correo: correo,
            edad: edad,
            grado: gradoInput.value
        });

        document.getElementById('form-hijo').reset();

        const mensajeExito = document.getElementById('mensaje-exito-hijo');
        mensajeExito.classList.remove('hidden');
        
        setTimeout(() => {
            mensajeExito.classList.add('hidden');
        }, 3000);
    } else {
        alert("Por favor, completa todos los campos antes de agregar.");
    }
}

function renderizarDashboardPadres() {
    const contenedor = document.getElementById('lista-hijos-dashboard');
    contenedor.innerHTML = '';

    if (hijosRegistrados.length === 0) {
        contenedor.innerHTML = '<p class="text-style-8 text-center text-muted">Aún no has agregado a ningún hijo.</p>';
        return;
    }

    hijosRegistrados.forEach((hijo, index) => {
        const esPrimerHijo = (index === 0);
        const isOnline = !esPrimerHijo;
        
        let infoHtml = '';
        
        if (isOnline) {
            infoHtml = `
                <div class="status-indicator mb-2">
                    <span class="status-dot optimal"></span>
                    <span class="text-style-8 text-green">En sesión</span>
                </div>
                <p class="text-style-8 text-muted mb-2">45 min activa</p>
                <p class="text-style-11 text-muted mb-1">Concentración:</p>
                <div class="progress-bar-container small">
                    <div class="progress-bar-fill bg-blue" style="width: 25%;"></div>
                </div>
                <p class="text-style-9 mb-2">25%</p>
            `;
        } else {
            infoHtml = `
                <div class="status-indicator mb-2">
                    <span class="status-dot bg-muted"></span>
                    <span class="text-style-8 text-muted">Sin sesión</span>
                </div>
                <p class="text-style-8 text-muted mb-2">Última: Ayer</p>
            `;
        }

        const tarjetaHTML = `
            <div class="hijo-card ${isOnline ? 'border-active' : 'border-inactive'}">
                <div class="hijo-card-body">
                    <div>
                        <div class="avatar-icon ${isOnline ? 'active' : 'inactive'}">👤</div>
                    </div>
                    <div style="flex-grow: 1;">
                        <h3 class="text-style-6">${hijo.nombre}</h3>
                        <p class="text-style-8 text-muted mb-2">${hijo.edad} años</p>
                        ${infoHtml}
                        <button class="card-btn" onclick="manejarClickHijo(${index})">VER DETALLE</button>
                    </div>
                </div>
            </div>
        `;
        
        contenedor.innerHTML += tarjetaHTML;
    });
}

function manejarClickHijo(index) {
    const hijo = hijosRegistrados[index];
    const isOnline = index !== 0;

    if (isOnline) {
        document.getElementById('detalle-hijo-header-name').innerText = hijo.nombre;
        document.getElementById('detalle-hijo-name').innerText = hijo.nombre;
        document.getElementById('detalle-hijo-info').innerText = `${hijo.edad} años - ${hijo.grado}`;
        
        document.getElementById('notificacion-hijo-subtitle').innerText = `${hijo.nombre} - Ahora`;
        document.getElementById('btn-enviar-mensaje-nombre').innerText = `A ${hijo.nombre.toUpperCase()}`;
        
        document.getElementById('mensaje-hijo-header').innerText = `Mensaje a ${hijo.nombre}`;
        document.getElementById('msg-opcion-2').innerText = `"${hijo.nombre}, la app indica que necesitas descansar. Pausa de 15 min 💙"`;
        
        document.getElementById('confirmacion-mensaje-subtitle').innerText = `${hijo.nombre} recibirá tu mensaje en su dispositivo.`;
        
        navegarA('pantalla-detalle-hijo');
    } else {
        const modalText = document.getElementById('offline-modal-text');
        modalText.innerText = `EN ESTE MOMENTO ${hijo.nombre} NO SE ENCUENTRA EN LINEA POR LO QUE LA SUPERVISION EN TIEMPO REAL NO ESTA DISPONIBLE`;
        document.getElementById('offline-modal').classList.remove('hidden');
    }
}

function cerrarModal() {
    document.getElementById('offline-modal').classList.add('hidden');
}

const navegarAOriginal2 = navegarA;
navegarA = function(idDestino) {
    navegarAOriginal2(idDestino);
    
    if (idDestino === 'pantalla-dashboard-padres') {
        renderizarDashboardPadres();
    }
}

function eliminarHijo() {
    const input = document.getElementById('eliminar-hijo-nombre');
    const nombreOriginal = input.value.trim();
    const nombre = nombreOriginal.toLowerCase();
    
    if (nombre === "") return;

    const index = hijosRegistrados.findIndex(h => h.nombre.toLowerCase() === nombre);
    
    if (index !== -1) {
        // Eliminar al hijo del arreglo de memoria
        hijosRegistrados.splice(index, 1);
        
        // Configurar el texto en mayúsculas e interactuar con el nuevo modal personalizado
        const modalText = document.getElementById('delete-modal-text');
        modalText.innerText = `SE HA ELIMINADO A ${nombreOriginal.toUpperCase()} DE TU LISTA CORRECTAMENTE`;
        document.getElementById('delete-success-modal').classList.remove('hidden');
        
        // Limpiar el campo de texto
        input.value = '';
    } else {
        alert("No se encontró ningún hijo registrado con ese nombre.");
    }
}

function cerrarModalDelete() {
    document.getElementById('delete-success-modal').classList.add('hidden');
}

function cambiarTamanoLetra(size) {
    document.querySelectorAll('.custom-radio-green').forEach(radio => {
        radio.classList.remove('checked');
        radio.innerText = '';
    });
    
    const selectedRadio = document.getElementById(`radio-${size}`);
    selectedRadio.classList.add('checked');
    selectedRadio.innerText = '✔';

    document.body.classList.remove('font-small', 'font-large');
    
    if (size === 'small') {
        document.body.classList.add('font-small');
    } else if (size === 'large') {
        document.body.classList.add('font-large');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Theme logic
    const dashboardThemeToggle = document.getElementById('dashboard-theme-toggle');
    const padresThemeToggle = document.getElementById('padres-theme-toggle');
    let currentTheme = localStorage.getItem('theme') || 'dark';

    function applyTheme(theme) {
        let currentLang = localStorage.getItem('lang') || 'es';
        const isEn = currentLang === 'en';
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (dashboardThemeToggle) dashboardThemeToggle.textContent = isEn ? 'Dark Mode' : 'Modo Oscuro';
            if (padresThemeToggle) padresThemeToggle.textContent = isEn ? 'Dark Mode' : 'Modo Oscuro';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (dashboardThemeToggle) dashboardThemeToggle.textContent = isEn ? 'Light Mode' : 'Modo Claro';
            if (padresThemeToggle) padresThemeToggle.textContent = isEn ? 'Light Mode' : 'Modo Claro';
        }
    }
    applyTheme(currentTheme);

    function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    }

    if (dashboardThemeToggle) dashboardThemeToggle.addEventListener('click', toggleTheme);
    if (padresThemeToggle) padresThemeToggle.addEventListener('click', toggleTheme);

    // Language logic
    const dashboardLangToggle = document.getElementById('dashboard-lang-toggle');
    const padresLangToggle = document.getElementById('padres-lang-toggle');
    const loginLangToggle = document.getElementById('login-lang-toggle');
    const loginPadresLangToggle = document.getElementById('login-padres-lang-toggle');
    let currentLang = localStorage.getItem('lang') || 'es';

    function updateLanguage() {
        if (dashboardLangToggle) dashboardLangToggle.textContent = currentLang === 'es' ? 'EN' : 'ES';
        if (padresLangToggle) padresLangToggle.textContent = currentLang === 'es' ? 'EN' : 'ES';
        if (loginLangToggle) loginLangToggle.textContent = currentLang === 'es' ? 'EN' : 'ES';
        if (loginPadresLangToggle) loginPadresLangToggle.textContent = currentLang === 'es' ? 'EN' : 'ES';
        
        // This relies on i18n data-i18n attributes on dashboard elements.
        const elements = document.querySelectorAll('[data-i18n]');
        if (window.translations && window.translations[currentLang]) {
            elements.forEach(function (element) {
                const key = element.getAttribute('data-i18n'); 
                if (window.translations[currentLang][key]) {
                    if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                        element.placeholder = window.translations[currentLang][key];
                    } else {
                        element.textContent = window.translations[currentLang][key];
                    }
                }
            });
        }
        
        applyTheme(localStorage.getItem('theme') || 'dark');
    }
    updateLanguage();

    function toggleLang() {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem('lang', currentLang);
        updateLanguage();
    }

    if (dashboardLangToggle) dashboardLangToggle.addEventListener('click', toggleLang);
    if (padresLangToggle) padresLangToggle.addEventListener('click', toggleLang);
    if (loginLangToggle) loginLangToggle.addEventListener('click', toggleLang);
    if (loginPadresLangToggle) loginPadresLangToggle.addEventListener('click', toggleLang);

    // Toast Container
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
});

function mostrarToast(mensaje) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    let currentLang = localStorage.getItem('lang') || 'es';
    let displayMessage = mensaje;
    if (window.translations && window.translations[currentLang] && window.translations[currentLang][mensaje]) {
        displayMessage = window.translations[currentLang][mensaje];
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = displayMessage;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300); // match css transition
    }, 3000);
}