// Liest den geheimen API-Schlüssel sicher aus der .env-Datei (Vite-Standard)
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// Basis-Adresse der OpenWeather-Schnittstelle (wird für alle Anfragen vorangestellt)
const BASE = "https://api.openweathermap.org/data/2.5";

// --- AKTUELLES WETTER PER STADTNAME ---
// async: Funktion wartet im Hintergrund auf Netzwerkdaten
// signal: Nimmt das AbortController-Signal zum Abbrechen entgegen
export async function getCurrentWeather(city, signal, units = "metrics") {
  // Baut die Webadresse zusammen:
  // - encodeURIComponent: Macht Umlaute/Leerzeichen URL-sicher (z. B. "München" -> "M%C3%BCnchen")
  // - units=metric: Temperatur in Celsius statt Kelvin/Fahrenheit
  // - lang=de: Deutsche Beschreibungen (z. B. "Leichter Regen")
  const url = `${BASE}/weather?q=${encodeURIComponent(city)}&units=${units}&lang=de&appid=${API_KEY}`;

  // fetch: Schickt die HTTP-Anfrage los; await wartet auf die Antwort des Servers
  const response = await fetch(url, { signal });

  // Prüft HTTP-Statuscode (200-299 = ok). Falls 404/500 etc. -> Fehler werfen und Funktion beenden
  if (!response.ok) throw new Error(`Das Wetter wurde nicht gefunden (${response.status})`);

  // Wandelt den empfangenen JSON-Text in ein echtes JavaScript-Objekt um und gibt es zurück
  return response.json();
}

// --- 5-TAGE-VORHERSAGE PER STADTNAME (3-STUNDEN-SCHRITTE) ---
export async function getForecast(city, signal, units = "metrics") {
  // Nutzt den /forecast-Endpunkt statt /weather
  const url = `${BASE}/forecast?q=${encodeURIComponent(city)}&units=${units}&lang=de&appid=${API_KEY}`;

  // Wartet auf die Server-Antwort und übergibt das Signal zum Abbrechen
  const response = await fetch(url, { signal });

  // Fehler werfen, falls die Vorhersage für den Ort nicht existiert
  if (!response.ok) throw new Error(`Vorhersage nicht gefunden (${response.status})`);

  // JSON-Daten parsen und als Objekt zurückgeben
  return response.json();
}

// --- AKTUELLES WETTER PER GPS-KOORDINATEN ---
// lat = Breitengrad (Latitude), lon = Längengrad (Longitude)
export async function getCurrentWeatherByCoords(lat, lon, signal, units = "metrics") {
  // Fragt Wetter direkt über Koordinaten ab (?lat=...&lon=...)
  const url = `${BASE}/weather?lat=${lat}&lon=${lon}&units=${units}&lang=de&appid=${API_KEY}`;

  const response = await fetch(url, { signal });

  if (!response.ok) throw new Error(`Das Wetter für diesen Standort wurde nicht gefunden (${response.status})`);

  return response.json();
}

// --- 5-TAGE-VORHERSAGE PER GPS-KOORDINATEN ---
export async function getForecastByCoords(lat, lon, signal, units = "metrics") {
  // Fragt 5-Tage-Vorhersage über Koordinaten ab
  const url = `${BASE}/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=de&appid=${API_KEY}`;

  const response = await fetch(url, { signal });

  if (!response.ok) throw new Error(`Vorhersage für diesen Standort nicht gefunden (${response.status})`);

  return response.json();
}