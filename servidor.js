// ============================================
// SERVIDOR NODEJS PARA GESTIONAR VOTOS
// ============================================

const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Ruta para guardar los votos
const ARCHIVO_VOTOS = path.join(__dirname, 'basedatos_votos.json');

// Función para obtener información del navegador y cliente
async function obtenerInformacionCliente(req) {
    const userAgent = req.get('user-agent');
    
    // Analizar el navegador
    let navegador = 'Desconocido';
    if (userAgent.includes('Chrome')) navegador = 'Google Chrome';
    else if (userAgent.includes('Safari')) navegador = 'Safari';
    else if (userAgent.includes('Firefox')) navegador = 'Firefox';
    else if (userAgent.includes('Edge')) navegador = 'Microsoft Edge';
    else if (userAgent.includes('Opera')) navegador = 'Opera';
    
    // Obtener información del sistema operativo
    let sistemaOperativo = 'Desconocido';
    if (userAgent.includes('Windows')) sistemaOperativo = 'Windows';
    else if (userAgent.includes('Mac')) sistemaOperativo = 'macOS';
    else if (userAgent.includes('Linux')) sistemaOperativo = 'Linux';
    else if (userAgent.includes('Android')) sistemaOperativo = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) sistemaOperativo = 'iOS';
    
    // Obtener IP
    const ip = req.ip || req.connection.remoteAddress || 'Desconocida';
    
    // Obtener información de geolocalización usando API gratuita
    let pais = 'No disponible';
    let ciudad = 'No disponible';
    
    try {
        const respuesta = await axios.get(`https://ipapi.co/${ip}/json/`);
        pais = respuesta.data.country_name || 'No disponible';
        ciudad = respuesta.data.city || 'No disponible';
    } catch (error) {
        console.log('No se pudo obtener la geolocalización:', error.message);
    }
    
    return {
        navegador,
        sistemaOperativo,
        ip,
        pais,
        ciudad,
        userAgent
    };
}

// Función para cargar o crear el archivo de votos
function cargarVotos() {
    if (fs.existsSync(ARCHIVO_VOTOS)) {
        const datos = fs.readFileSync(ARCHIVO_VOTOS, 'utf-8');
        return JSON.parse(datos);
    }
    
    return {
        addonNombre: 'Better on Bedrock v1.1.3',
        totalVotos: 0,
        votos: {
            si: 0,
            no: 0,
            quiza: 0
        },
        detallesVotos: []
    };
}

// Función para guardar votos
function guardarVotos(datos) {
    fs.writeFileSync(ARCHIVO_VOTOS, JSON.stringify(datos, null, 2), 'utf-8');
}

// RUTA: Verificar si una IP ya votó
app.get('/api/verificar-voto', async (req, res) => {
    try {
        const infoCliente = await obtenerInformacionCliente(req);
        const datosVotos = cargarVotos();
        
        // Verificar si esta IP ya votó
        const yaVoto = datosVotos.detallesVotos.some(v => v.ip === infoCliente.ip);
        
        res.json({
            yaVoto: yaVoto,
            ip: infoCliente.ip
        });
    } catch (error) {
        console.error('Error al verificar voto:', error);
        res.status(500).json({ error: 'Error al verificar voto' });
    }
});

// RUTA: Registrar un voto
app.post('/api/registrar-voto', async (req, res) => {
    try {
        const { voto } = req.body;
        
        if (!['si', 'no', 'quiza'].includes(voto)) {
            return res.status(400).json({ error: 'Voto inválido' });
        }
        
        // Obtener información del cliente
        const infoCliente = await obtenerInformacionCliente(req);
        
        // Cargar votos actuales
        const datosVotos = cargarVotos();
        
        // Verificar si esta IP ya votó
        const yaVoto = datosVotos.detallesVotos.some(v => v.ip === infoCliente.ip);
        if (yaVoto) {
            return res.status(403).json({ 
                error: 'Ya has votado desde esta IP', 
                exito: false 
            });
        }
        
        // Incrementar contador
        datosVotos.votos[voto]++;
        datosVotos.totalVotos++;
        
        // Guardar detalles del voto
        const detalleVoto = {
            id: datosVotos.detallesVotos.length + 1,
            voto: voto,
            fecha: new Date().toLocaleString('es-CL'),
            timestamp: new Date().getTime(),
            navegador: infoCliente.navegador,
            sistemaOperativo: infoCliente.sistemaOperativo,
            ip: infoCliente.ip,
            pais: infoCliente.pais,
            ciudad: infoCliente.ciudad
        };
        
        datosVotos.detallesVotos.push(detalleVoto);
        
        // Guardar en archivo JSON
        guardarVotos(datosVotos);
        
        // Calcular porcentajes
        const porcentajeSi = datosVotos.totalVotos > 0 ? (datosVotos.votos.si / datosVotos.totalVotos * 100).toFixed(1) : 0;
        const porcentajeNo = datosVotos.totalVotos > 0 ? (datosVotos.votos.no / datosVotos.totalVotos * 100).toFixed(1) : 0;
        const porcentajeQuiza = datosVotos.totalVotos > 0 ? (datosVotos.votos.quiza / datosVotos.totalVotos * 100).toFixed(1) : 0;
        
        res.json({
            exito: true,
            mensaje: 'Voto registrado correctamente',
            votos: {
                si: datosVotos.votos.si,
                no: datosVotos.votos.no,
                quiza: datosVotos.votos.quiza,
                total: datosVotos.totalVotos,
                porcentajes: {
                    si: porcentajeSi,
                    no: porcentajeNo,
                    quiza: porcentajeQuiza
                }
            }
        });
        
    } catch (error) {
        console.error('Error al registrar voto:', error);
        res.status(500).json({ error: 'Error al registrar el voto' });
    }
});

// RUTA: Obtener estadísticas actuales
app.get('/api/estadisticas-votos', (req, res) => {
    try {
        const datosVotos = cargarVotos();
        
        const porcentajeSi = datosVotos.totalVotos > 0 ? (datosVotos.votos.si / datosVotos.totalVotos * 100).toFixed(1) : 0;
        const porcentajeNo = datosVotos.totalVotos > 0 ? (datosVotos.votos.no / datosVotos.totalVotos * 100).toFixed(1) : 0;
        const porcentajeQuiza = datosVotos.totalVotos > 0 ? (datosVotos.votos.quiza / datosVotos.totalVotos * 100).toFixed(1) : 0;
        
        res.json({
            addon: datosVotos.addonNombre,
            votos: {
                si: datosVotos.votos.si,
                no: datosVotos.votos.no,
                quiza: datosVotos.votos.quiza,
                total: datosVotos.totalVotos,
                porcentajes: {
                    si: porcentajeSi,
                    no: porcentajeNo,
                    quiza: porcentajeQuiza
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// RUTA: Obtener todos los detalles de votos (para panel de administración)
app.get('/api/detalles-votos', (req, res) => {
    try {
        const datosVotos = cargarVotos();
        
        res.json({
            addon: datosVotos.addonNombre,
            resumen: {
                totalVotos: datosVotos.totalVotos,
                si: datosVotos.votos.si,
                no: datosVotos.votos.no,
                quiza: datosVotos.votos.quiza
            },
            detalles: datosVotos.detallesVotos
        });
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
});

// RUTA: Estadísticas por país
app.get('/api/estadisticas-pais', (req, res) => {
    try {
        const datosVotos = cargarVotos();
        const estadisticasPais = {};
        
        datosVotos.detallesVotos.forEach(voto => {
            if (!estadisticasPais[voto.pais]) {
                estadisticasPais[voto.pais] = { si: 0, no: 0, quiza: 0, total: 0 };
            }
            estadisticasPais[voto.pais][voto.voto]++;
            estadisticasPais[voto.pais].total++;
        });
        
        res.json({
            addon: datosVotos.addonNombre,
            estadisticasPais
        });
    } catch (error) {
        console.error('Error al obtener estadísticas por país:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// RUTA: Estadísticas por navegador
app.get('/api/estadisticas-navegador', (req, res) => {
    try {
        const datosVotos = cargarVotos();
        const estadisticasNavegador = {};
        
        datosVotos.detallesVotos.forEach(voto => {
            if (!estadisticasNavegador[voto.navegador]) {
                estadisticasNavegador[voto.navegador] = { si: 0, no: 0, quiza: 0, total: 0 };
            }
            estadisticasNavegador[voto.navegador][voto.voto]++;
            estadisticasNavegador[voto.navegador].total++;
        });
        
        res.json({
            addon: datosVotos.addonNombre,
            estadisticasNavegador
        });
    } catch (error) {
        console.error('Error al obtener estadísticas por navegador:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Puerto (Railway asigna automáticamente PORT)
const PUERTO = process.env.PORT || process.env.PUERTO || 3000;

// Permitir CORS para GitHub Pages
app.use(cors({
    origin: ['https://mikelsx.github.io', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));

app.listen(PUERTO, () => {
    const ambiente = process.env.NODE_ENV || 'desarrollo';
    const urlPublica = process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `http://localhost:${PUERTO}`;
    
    console.log(`========================================`);
    console.log(`Servidor de Votos - UFT Minecraft`);
    console.log(`========================================`);
    console.log(`✓ Ambiente: ${ambiente}`);
    console.log(`✓ Servidor ejecutándose en puerto: ${PUERTO}`);
    console.log(`✓ URL pública: ${urlPublica}`);
    console.log(`✓ URL local: http://localhost:${PUERTO}`);
    console.log(`✓ Base de datos: ${ARCHIVO_VOTOS}`);
    console.log(`========================================`);
});
