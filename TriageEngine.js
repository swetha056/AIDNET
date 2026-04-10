export const getSeverityWeight = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 1000;
    case 'medium': return 500;
    case 'low': return 100;
    default: return 0;
  }
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

// Calculates real-world distance between user and SOS sender using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const calculatePriorityScore = (packet, userLat, userLon) => {
  let score = getSeverityWeight(packet.severity);
  const distance = calculateDistance(packet.latitude, packet.longitude, userLat, userLon);
  
  if (distance !== Infinity) {
    // Priority Score: Score = SeverityWeight - (Distance * 10)
    score -= (distance * 10);
  }

  const status = packet.status?.toLowerCase();
  // Status Penalty: If status is 'dispatched' or 'guided', subtract 2000 points
  if (status === 'dispatched' || status === 'guided') {
    score -= 2000;
  }

  return { ...packet, distance, score };
};

export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brng = Math.atan2(y, x);
  return ((((brng * 180) / Math.PI) + 360) % 360);
};

export const sortPackets = (packets, userLat, userLon) => {
  return packets
    .map(p => {
        const scoreData = calculatePriorityScore(p, userLat, userLon);
        const bearing = calculateBearing(userLat, userLon, p.latitude, p.longitude);
        return { ...scoreData, bearing };
    })
    .sort((a, b) => b.score - a.score);
};
