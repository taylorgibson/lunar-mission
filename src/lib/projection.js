export function pxmap(width, height, lat, lon) {
  const px = ((lon + Math.PI) / (2 * Math.PI)) * width;
  const py = ((Math.PI / 2 - lat) / Math.PI) * height;
  return [px, py];
}

export function haversine(lat1, lon1, lat2, lon2) {
  const dlon = lon2 - lon1;
  const dlat = lat2 - lat1;
  const a = Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c;
}
