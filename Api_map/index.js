import 'dotenv/config'; 
import express from 'express';
import sqlite3 from 'sqlite3';

const app = express();

// Configuración mediante variables de entorno
const PORT = process.env.PORT || 3000;
const UA = process.env.USER_AGENT || 'LabUCSM/1.0 (Laboratorio Academico)';

// Inicialización de la Base de Datos SQLite
const db = new sqlite3.Database('./historial.db');

// Crear tabla de historial si no existe
db.run(`CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    entrada TEXT,
    resultado TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.json());
app.use(express.static('public'));

// Helper fetch con User-Agent requerido por la política de Nominatim [cite: 33, 56]
const osmFetch = url => fetch(url, { headers: { 'User-Agent': UA } }).then(r => r.json());

/**
 * Endpoint 1: Geocodificación Inversa (Nominatim) [cite: 15, 38]
 * Convierte coordenadas en una dirección textual.
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

        // Guardado en historial (SQLite)
        db.run("INSERT INTO historial (tipo, entrada, resultado) VALUES (?, ?, ?)", 
            ['GEOCODE', `Lat: ${lat}, Lon: ${lon}`, respuesta.direccion]);

        res.json(respuesta);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * Endpoint 2: Ruta entre dos puntos (OSRM) [cite: 16, 40]
 * Calcula distancia, duración y geometría.
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

        // Guardado en historial (SQLite)
        db.run("INSERT INTO historial (tipo, entrada, resultado) VALUES (?, ?, ?)", 
            ['RUTA', `De ${oLat},${oLon} a ${dLat},${dLon}`, `${respuesta.distancia_km} km / ${respuesta.duracion_min} min`]);

        res.json(respuesta);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
    console.log(`Usando User-Agent: ${UA}`);
});
