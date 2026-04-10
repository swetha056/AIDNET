// Web Version: No SQLite
export const initMeshDB = () => {
    console.warn("SQLite skipped: Web environment detected.");
    return null;
};

export const savePacketToMesh = (packet) => {
    // No-op on Web
};

export const getAllLocalPackets = () => [];
