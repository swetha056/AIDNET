import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, push } from 'firebase/database';
import { Platform } from 'react-native';
import { initMeshDB, savePacketToMesh, getAllLocalPackets } from './MeshDB';

const Network = Platform.OS !== 'web' ? require('expo-network') : null;

// Firebase Config - placeholders for user to fill later
const firebaseConfig = {
  apiKey: "AIzaSyCxKXh5HJR69LgNJRLCW3NqBDEASSAQXoo",
  authDomain: "aidnet-00701.firebaseapp.com",
  databaseURL: "https://aidnet-00701-default-rtdb.firebaseio.com",
  projectId: "aidnet-00701",
  storageBucket: "aidnet-00701.firebasestorage.app",
  messagingSenderId: "627651671194",
  appId: "1:627651671194:web:e1f1c6b841dc5a1541b23"
};

let db = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } else {
    console.warn("Firebase credentials not configured. Using local-only mode.");
    // Mock db object to avoid crashes
    db = {
      isMock: true,
      ref: () => ({}),
      set: () => Promise.resolve(),
      push: () => ({ key: 'mock_' + Math.random() })
    };
  }
} catch (error) {
  console.error("Firebase init failed:", error);
  db = { isMock: true };
}

export { db };

// Offline Sync Logic
export const syncOfflineData = async () => {
  if (db.isMock || !Network) return;
  const state = await Network.getNetworkStateAsync();
  if (state.isConnected && state.isInternetReachable) {
    const localPackets = getAllLocalPackets();
    localPackets.forEach(async (packet) => {
      try {
        await set(ref(db, `packets/${packet.id}`), packet);
        console.log("Synced packet:", packet.id);
      } catch (e) { console.error("Sync failed for", packet.id, e); }
    });
  }
};

// Check network periodically or on change
if (Network) {
  Network.addNetworkStateListener((state) => {
    if (state.isConnected) syncOfflineData();
  });
}

// Initialize Mesh Storage (SQLite on Native, Mock on Web)
initMeshDB();

export { savePacketToMesh };
