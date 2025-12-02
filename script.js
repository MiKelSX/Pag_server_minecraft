// ============================================
// INICIALIZACIÓN DEL SISTEMA
// ============================================

// Detectar URL de API automáticamente
const obtenerURLAPI = () => {
    // Si estamos en GitHub Pages, usar la URL de Railway configurada
    if (window.location.hostname === 'mikelsx.github.io') {
        return 'precious-illumination-production-64d0.up.railway.app';
    }
    // Si estamos en localhost (desarrollo local), usar localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // Fallback a la URL base (en caso de que esté hosteado en otro lado)
    return window.location.origin;
};

const API_URL = obtenerURLAPI();

console.log('🔗 URL de API detectada:', API_URL);

window.addEventListener('DOMContentLoaded', () => {
    inicializarSistemaAnuncios();
    configurarSuavizado();
});

// ============================================
// SISTEMA DE ANUNCIOS Y VOTACIÓN
// ============================================

let yaVoto = false;

function inicializarSistemaAnuncios() {
    const overlay = document.getElementById('announcementOverlay');
    const contador = document.getElementById('announcementCounter');
    let tiempoRestante = 10;
    
    // Iniciar contador de 10 segundos
    const intervaloContador = setInterval(() => {
        tiempoRestante--;
        contador.textContent = tiempoRestante;
        
        if (tiempoRestante <= 0) {
            clearInterval(intervaloContador);
            contador.classList.add('hidden');
        }
    }, 1000);
    
    // Cargar y mostrar resultados de votación
    cargarResultadosVotacion();
}

function cerrarAnuncio() {
    const overlay = document.getElementById('announcementOverlay');
    overlay.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

async function registrarVoto(voto) {
    if (yaVoto) {
        mostrarNotificacion('Ya has votado anteriormente', 'advertencia');
        return;
    }
    
    try {
        const respuesta = await fetch(`${API_URL}/api/registrar-voto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ voto })
        });
        
        if (!respuesta.ok) {
            throw new Error('Error al registrar voto');
        }
        
        const datos = await respuesta.json();
        
        if (datos.exito) {
            yaVoto = true;
            localStorage.setItem('yaVotoAddonBedrock', 'true');
            
            // Actualizar interfaz
            deshabilitarBotonesVoto();
            actualizarResultadosUI(datos.votos);
            mostrarNotificacion('¡Gracias por tu voto!', 'exito');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al procesar el voto. Intenta de nuevo.', 'error');
    }
}

async function cargarResultadosVotacion() {
    try {
        const respuesta = await fetch(`${API_URL}/api/estadisticas-votos`);
        const datos = await respuesta.json();
        
        actualizarResultadosUI(datos.votos);
        
        // Verificar si el usuario ya votó
        if (localStorage.getItem('yaVotoAddonBedrock')) {
            yaVoto = true;
            deshabilitarBotonesVoto();
        }
    } catch (error) {
        console.error('Error al cargar resultados:', error);
    }
}

function actualizarResultadosUI(votos) {
    const seccionResultados = document.getElementById('votingResults');
    seccionResultados.style.display = 'block';
    
    // Actualizar barras de progreso
    document.getElementById('resultSi').style.width = votos.porcentajes.si + '%';
    document.getElementById('resultNo').style.width = votos.porcentajes.no + '%';
    document.getElementById('resultQuiza').style.width = votos.porcentajes.quiza + '%';
    
    // Actualizar contadores
    document.getElementById('resultSiCount').textContent = votos.si;
    document.getElementById('resultNoCount').textContent = votos.no;
    document.getElementById('resultQuizaCount').textContent = votos.quiza;
}

function deshabilitarBotonesVoto() {
    const botonesVoto = document.querySelectorAll('.vote-btn');
    botonesVoto.forEach(boton => {
        boton.disabled = true;
        boton.style.opacity = '0.5';
        boton.style.cursor = 'not-allowed';
    });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        max-width: 300px;
    `;
    
    // Estilos según tipo
    const estilos = {
        exito: {
            background: 'rgba(34, 197, 94, 0.9)',
            color: '#ffffff',
            border: '1px solid rgba(34, 197, 94, 0.5)'
        },
        error: {
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            border: '1px solid rgba(239, 68, 68, 0.5)'
        },
        advertencia: {
            background: 'rgba(245, 158, 11, 0.9)',
            color: '#ffffff',
            border: '1px solid rgba(245, 158, 11, 0.5)'
        },
        info: {
            background: 'rgba(96, 165, 250, 0.9)',
            color: '#ffffff',
            border: '1px solid rgba(96, 165, 250, 0.5)'
        }
    };
    
    const estiloAplicar = estilos[tipo] || estilos.info;
    Object.assign(notificacion.style, estiloAplicar);
    
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

// ============================================
// ANIMACIONES Y SUAVIZADO
// ============================================

function configurarSuavizado() {
    // Desplazamiento suave para navegación
    document.querySelectorAll('a[href^="#"]').forEach(enlace => {
        enlace.addEventListener('click', function (e) {
            e.preventDefault();
            const destino = document.querySelector(this.getAttribute('href'));
            if(destino) {
                destino.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animación de desvanecimiento al entrar
    const opcionesObservador = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.style.opacity = '1';
                entrada.target.style.transform = 'translateY(0)';
            }
        });
    }, opcionesObservador);
    
    document.querySelectorAll('section').forEach(seccion => {
        seccion.style.opacity = '0';
        seccion.style.transform = 'translateY(20px)';
        seccion.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observador.observe(seccion);
    });
}

// ============================================
// ESTILOS DINÁMICOS
// ============================================

const hojaEstilos = document.createElement('style');
hojaEstilos.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(hojaEstilos);