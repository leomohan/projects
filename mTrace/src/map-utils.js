export function projectPoint(longitude, latitude, width, height) {
  const x = ((longitude + 180) / 360) * width;
  const y = ((90 - latitude) / 180) * height;
  return { x, y };
}

export function buildArcPath(fromPoint, toPoint) {
  const deltaX = toPoint.x - fromPoint.x;
  const arcHeight = Math.max(40, Math.abs(deltaX) * 0.18);
  const controlX = fromPoint.x + deltaX / 2;
  const controlY = Math.min(fromPoint.y, toPoint.y) - arcHeight;
  return `M ${fromPoint.x} ${fromPoint.y} Q ${controlX} ${controlY} ${toPoint.x} ${toPoint.y}`;
}

export function formatLatency(value) {
  return `${value.toFixed(1)} ms`;
}

export function haversineDistanceKm(from, to) {
  const radiusKm = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
