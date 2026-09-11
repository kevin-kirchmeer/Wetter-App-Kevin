// Liest den geheimen API-Schlüssel sicher aus der .env-Datei (Vite-Standard)
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// Basis-Adresse der OpenWeather-Schnittstelle (wird vor jede Anfrage gesetzt)
const BASE = "https://api.openweathermap.org/data/2.5";

// --- AKTUELLES WETTER PER STADTNAME ---
// - async: Funktion wartet im Hintergrund auf Server-Antworten
// - city: Name der gesuchten Stadt (z. B. "Berlin")
// - signal: Erlaubt dem AbortController, die Anfrage bei Bedarf abzubrechen
// - units = "metric": Standard-Einheit (metric = Celsius; OpenWeather erwartet 'metric' ohne 's')
export async function getCurrentWeather(city, signal, units = "metric") {
  // Baut die Webadresse zusammen:
  // - encodeURIComponent(city): Verhindert Fehler bei Umlauten & Leerzeichen (z. B. "München" -> "M%C3%BCnchen")
  // - units=${units}: Übergibt Celsius ("metric") oder Fahrenheit ("imperial")
  // - lang=de: Deutsche Wetterbeschreibungen (z. B. "Mäßiger Regen")
  // - appid=${API_KEY}: Übergibt den geheimen Zugangsschlüssel
  const url = `${BASE}/weather?q=${encodeURIComponent(city)}&units=${units}&lang=de&appid=${API_KEY}`;

  // fetch: Schickt die HTTP-Anfrage los; await wartet auf die Antwort des Servers
  const response = await fetch(url, { signal });

  // Prüft HTTP-Statuscode: Falls Server 404 (nicht gefunden) oder 500 meldet -> Fehler auslösen
  if (!response.ok) throw new Error(`Das Wetter wurde nicht gefunden (${response.status})`);

  // Wandelt die empfangenen Rohdaten (JSON) in ein nutzbares JavaScript-Objekt um
  return response.json();
}

// --- 5-TAGE-VORHERSAGE PER STADTNAME (IN 3-STUNDEN-SCHRITTEN) ---
// - Holt die Vorhersage-Daten für die nächsten 5 Tage per Stadtname
export async function getForecast(city, signal, units = "metric") {
  // Nutzt den /forecast-Endpunkt statt /weather
  const url = `${BASE}/forecast?q=${encodeURIComponent(city)}&units=${units}&lang=de&appid=${API_KEY}`;

  // Wartet auf die Server-Antwort und übergibt das Abbruch-Signal
  const response = await fetch(url, { signal });

  // Fehler werfen, falls keine Vorhersage-Daten vorhanden sind
  if (!response.ok) throw new Error(`Vorhersage nicht gefunden (${response.status})`);

  // JSON-Antwort parsen und als Objekt zurückgeben
  return response.json();
}

// --- AKTUELLES WETTER PER GPS-KOORDINATEN ---
// - lat: Breitengrad (Latitude)
// - lon: Längengrad (Longitude)
// - signal: Abbruch-Signal
// - units: Maßeinheit (Standard: metric)
export async function getCurrentWeatherByCoords(lat, lon, signal, units = "metric") {
  // Fragt aktuelles Wetter direkt über Koordinaten ab (?lat=...&lon=...)
  const url = `${BASE}/weather?lat=${lat}&lon=${lon}&units=${units}&lang=de&appid=${API_KEY}`;

  // Anfrage abschicken und auf Server-Rückmeldung warten
  const response = await fetch(url, { signal });

  // Fehler werfen, falls Koordinaten ungültig sind oder keine Daten existieren
  if (!response.ok) throw new Error(`Das Wetter für diesen Standort wurde nicht gefunden (${response.status})`);

  // JSON-Daten in ein JavaScript-Objekt umwandeln
  return response.json();
}

// --- 5-TAGE-VORHERSAGE PER GPS-KOORDINATEN ---
// - Holt die Vorhersage-Daten für die nächsten 5 Tage anhand von Koordinaten
export async function getForecastByCoords(lat, lon, signal, units = "metric") {
  // Fragt die 5-Tage-Vorhersage über Koordinaten ab
  const url = `${BASE}/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=de&appid=${API_KEY}`;

  // Anfrage abschicken und auf Antwort warten
  const response = await fetch(url, { signal });

  // Fehler werfen, falls Vorhersage für diese Koordinaten fehlschlägt
  if (!response.ok) throw new Error(`Vorhersage für diesen Standort nicht gefunden (${response.status})`);

  // Fertiges Datenobjekt zurückgeben
  return response.json();
}