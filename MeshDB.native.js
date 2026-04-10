import * as SQLite from 'expo-sqlite';

let localDb = null;

export const initMeshDB = () => {
    try {
        localDb = SQLite.openDatabaseSync('mesh_storage.db');
        localDb.execSync(`
            CREATE TABLE IF NOT EXISTS packets (
                id TEXT PRIMARY KEY,
                senderName TEXT,
                severity TEXT,
                latitude REAL,
                longitude REAL,
                message TEXT,
                status TEXT,
                timestamp INTEGER
            );
        `);
        return localDb;
    } catch (error) {
        console.warn("SQLite initialization failed on native.", error);
        return null;
    }
};

export const savePacketToMesh = (packet) => {
    if (!localDb) return;
    try {
        const { id, senderName, severity, latitude, longitude, message, status, timestamp } = packet;
        localDb.runSync(
            'INSERT OR REPLACE INTO packets (id, senderName, severity, latitude, longitude, message, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, senderName, severity, latitude, longitude, message, status, timestamp]
        );
    } catch (error) {
        console.error("Local save error", error);
    }
};

export const getAllLocalPackets = () => {
    if (!localDb) return [];
    try {
        return localDb.getAllSync('SELECT * FROM packets');
    } catch (e) { return []; }
};
