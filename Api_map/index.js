import 'dotenv/config'; 
import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors'; // Importamos CORS para comunicación entre puertos

const app = express();

// Configuraciones desde variables de entorno [cite: 18]
const PORT = process.env.PORT || 4000; // Usamos 4000 para el backend
const UA = process.env.USER_AGENT || 'LabUCSM/1.0 (Laboratorio Academico)';

// 1. Configuración de CORS
// Esto permite que el navegador acepte peticiones desde tu servidor Python
app.use(cors({
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Inicialización de la Base de Datos SQLite [cite: 31]
const db = new sqlite3.Database('./historial.db');

// Crear tabla de historial para auditoría interna
db.run(`CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    entrada TEXT,
    resultado TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.json());
// Servimos archivos estáticos por si acaso, aunque tu front esté en Python
app.use(express.static('public')); 

// Helper fetch con User-Agent requerido por la política de Nominatim [cite: 18, 56]
const osmFetch = url => fetch(url, { headers: { 'User-Agent': UA } }).then(r => r.json());

/**
 * Endpoint 1: Geocodificación Inversa (Nominatim)
 */
app.get('/api/geocode', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Se requieren lat y lon' });

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const data = await osmFetch(url);
        
        const respuesta = {
            direccion: data.display_name,
            ciudad: data.address?.city || data.address?.town,
            pais: data.address?.country
        };

        // Guardado silencioso en historial
        db.run("INSERT INTO historial (tipo, entrada, resultado) VALUES (?, ?, ?)", 
            ['GEOCODE', `Lat: ${lat}, Lon: ${lon}`, respuesta.direccion]);

        res.json(respuesta);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Endpoint 2: Ruta entre dos puntos (OSRM)
 */
app.get('/api/ruta', async (req, res) => {
    const { oLat, oLon, dLat, dLon } = req.query;
    if (!oLat || !oLon || !dLat || !dLon) {
        return res.status(400).json({ error: 'Faltan coordenadas de origen o destino' });
    }

    try {
        // OSRM utiliza el formato [longitud, latitud] [cite: 73]
        const url = `https://router.project-osrm.org/route/v1/driving/${oLon},${oLat};${dLon},${dLat}?overview=full&geometries=geojson`;
        const data = await osmFetch(url);
        
        if (data.code !== 'Ok') return res.status(502).json({ error: data.code });
        
        const ruta = data.routes[0];
        const respuesta = {
            distancia_km: (ruta.distance / 1000).toFixed(2),
            duracion_min: (ruta.duration / 60).toFixed(1),
            geometria: ruta.geometry
        };

        // Guardado silencioso en historial
        db.run("INSERT INTO historial (tipo, entrada, resultado) VALUES (?, ?, ?)", 
            ['RUTA', `De ${oLat},${oLon} a ${dLat},${dLon}`, `${respuesta.distancia_km} km`]);

        res.json(respuesta);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Node.js activo en puerto ${PORT}`);
    console.log(`Aceptando peticiones desde http://localhost:5000 (CORS)`);
});
