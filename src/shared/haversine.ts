interface Location {
  lat: number;
  lng: number;
}

export default function haversine(from: Location, to: Location, km = 20000000): boolean {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d <= km;
}
