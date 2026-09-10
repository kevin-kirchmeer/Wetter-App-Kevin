const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE = "https://api.openweathermap.org/data/2.5";

// Aktuelles Wetter für einen Ort

export async function getCurrentWeather(city, signal) {
  const url = `${BASE}/weather?q=${encodeURIComponent(city)}&units=metric&lang=de&appid=${API_KEY}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Das Wetter wurde nicht gefunden (${response.status})`);
  return response.json();
}

// 5 Tage Vorhersage (in 3 Stunden Schritten) für einen Ort

export async function getForecast(city, signal) {
  const url = `${BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&lang=de&appid=${API_KEY}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Vorhersage nicht gefunden (${response.status})`);
  return response.json();
}

// Aktuelles Wetter nach Koordinaten
export async function getCurrentWeatherByCoords(lat, lon, signal) {
  const url = `${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&lang=de&appid=${API_KEY}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Das Wetter für diesen Standort wurde nicht gefunden (${response.status})`);
  return response.json();
}

// 5-Tage-Vorhersage nach Koordinaten
export async function getForecastByCoords(lat, lon, signal) {
  const url = `${BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=de&appid=${API_KEY}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Vorhersage für diesen Standort nicht gefunden (${response.status})`);
  return response.json();
}