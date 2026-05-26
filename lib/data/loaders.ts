export async function loadGeoJSON(path: string): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
