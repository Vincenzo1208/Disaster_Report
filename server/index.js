import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Fix CORS: Allow localhost and Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://disaster-report.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE incidents (
      id TEXT PRIMARY KEY,
      incidentType TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      reporterName TEXT,
      timestamp TEXT NOT NULL
    )
  `);

  const sampleIncidents = [
    {
      id: '1',
      incidentType: 'Fire',
      severity: 'Critical',
      description: 'Large warehouse fire spreading rapidly. Multiple fire departments responding.',
      latitude: 40.7589,
      longitude: -73.9851,
      reporterName: 'John Smith',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      incidentType: 'Flood',
      severity: 'High',
      description: 'Flash flooding in downtown area. Several streets impassable.',
      latitude: 40.7505,
      longitude: -73.9934,
      reporterName: null,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      incidentType: 'Explosion',
      severity: 'Critical',
      description: 'Industrial explosion at chemical plant. Evacuation zone established.',
      latitude: 40.7282,
      longitude: -74.0776,
      reporterName: 'Emergency Services',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      incidentType: 'Medical Emergency',
      severity: 'Medium',
      description: 'Multi-vehicle accident on highway. Several injuries reported.',
      latitude: 40.7614,
      longitude: -73.9776,
      reporterName: 'Highway Patrol',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO incidents (id, incidentType, severity, description, latitude, longitude, reporterName, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleIncidents.forEach(incident => {
    stmt.run(
      incident.id,
      incident.incidentType,
      incident.severity,
      incident.description,
      incident.latitude,
      incident.longitude,
      incident.reporterName,
      incident.timestamp
    );
  });

  stmt.finalize();
});

// API Routes
app.get('/api/incidents', (req, res) => {
  const { types, severities, startDate, endDate } = req.query;

  let sql = 'SELECT * FROM incidents WHERE 1=1';
  const params = [];

  if (types && types.length > 0) {
    const typeArray = Array.isArray(types) ? types : [types];
    const placeholders = typeArray.map(() => '?').join(',');
    sql += ` AND incidentType IN (${placeholders})`;
    params.push(...typeArray);
  }

  if (severities && severities.length > 0) {
    const severityArray = Array.isArray(severities) ? severities : [severities];
    const placeholders = severityArray.map(() => '?').join(',');
    sql += ` AND severity IN (${placeholders})`;
    params.push(...severityArray);
  }

  if (startDate) {
    sql += ' AND timestamp >= ?';
    params.push(startDate);
  }

  if (endDate) {
    sql += ' AND timestamp <= ?';
    params.push(endDate + 'T23:59:59.999Z');
  }

  sql += ' ORDER BY timestamp DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Failed to fetch incidents' });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/incidents', (req, res) => {
  const { incidentType, severity, description, latitude, longitude, reporterName } = req.body;

  if (!incidentType || !severity || !description || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString();

  const sql = `
    INSERT INTO incidents (id, incidentType, severity, description, latitude, longitude, reporterName, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [id, incidentType, severity, description, latitude, longitude, reporterName || null, timestamp], function (err) {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Failed to create incident' });
      return;
    }

    const newIncident = {
      id,
      incidentType,
      severity,
      description,
      latitude,
      longitude,
      reporterName: reporterName || null,
      timestamp
    };

    res.status(201).json(newIncident);
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Disaster Incident Reporter API running on port ${PORT}`);
  console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
});

process.on('SIGTERM', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
