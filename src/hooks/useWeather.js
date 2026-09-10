// Hilfsfunktionen für API-Aufrufe importieren
import {
  getCurrentWeather,
  getForecast,
  getCurrentWeatherByCoords,
  getForecastByCoords,
} from "../api/weatherApi";

// React Hooks: useState (Speicher) & useEffect (Nebeneffekte/Laden)
import { useEffect, useState } from "react";

export default function useWeather(city) {
  // --- STATES (Das Gedächtnis der Komponente) ---
  const [current, setCurrent] = useState(null); // Speichert die empfangenen aktuellen Wetterdaten
  const [forecast, setForecast] = useState([]); // Speichert die 5-Tage-Vorhersage als Array
  const [loading, setLoading] = useState(false); // Ampel: Lädt die App gerade Daten? (true/false)
  const [error, setError] = useState(null); // Speichert Fehlermeldungen für den Nutzer
  const [locating, setLocating] = useState(false); // Ampel: Sucht das Gerät gerade GPS? (true/false)
  const [coords, setCoords] = useState(null); // GPS-Daten: { lat, lon } oder null

  // --- USEEFFECT (Reagiert auf Änderungen von city oder coords) ---
  useEffect(() => {
    // Not-Aus-Schalter: Bricht veraltete Netzwerkanfragen ab
    const controller = new AbortController();

    async function load() {
      setLoading(true); // Ladebalken aktivieren
      setError(null); // Alten Fehler zurücksetzen

      try {
        // Promise.all startet beide Requests zeitgleich im Netzwerk
        const [weatherData, forecastData] = await (coords
          ? Promise.all([
              getCurrentWeatherByCoords(
                coords.lat,
                coords.lon,
                controller.signal,
              ),
              getForecastByCoords(coords.lat, coords.lon, controller.signal),
            ])
          : Promise.all([
              getCurrentWeather(city, controller.signal),
              getForecast(city, controller.signal),
            ]));

        // Daten im State speichern -> Löst Re-Render aus
        setCurrent(weatherData);

        // Filter: Aus allen 3-Stunden-Werten nur die um 12:00 Uhr mittags behalten
        setForecast(
          forecastData.list.filter((item) => item.dt_txt.includes("12:00:00")),
        );
      } catch (error) {
        // Gewollte Abbrüche ignorieren, echte Fehler im State speichern
        if (error.name !== "AbortError") setError(error.message);
      } finally {
        setLoading(false); // Ladebalken immer deaktivieren (egal ob Erfolg oder Fehler)
      }
    }

    load();

    // Cleanup-Funktion: Bricht alte Anfrage ab, wenn sich city/coords ändern
    return () => controller.abort();
  }, [city, coords]); // Dependency-Array: Feuert nur neu, wenn city oder coords sich ändern

  // GPS-Standort ermitteln
  function handleGeolocation() {
    // Check: Kann der Browser überhaupt Geolocation?
    if (!navigator.geolocation) {
      setError("Standortermittlung wird von deinem Browser nicht unterstützt.");
      return;
    }

    setLocating(true); // GPS-Ladezustand aktivieren
    setError(null); // Fehler zurücksetzen

    // Browser-Standort abfragen
    navigator.geolocation.getCurrentPosition(
      // Erfolg: Koordinaten speichern -> triggert useEffect
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocating(false);
      },
      // Fehler: Zugriff verweigert oder Timeout nach 10s
      () => {
        setError(
          "Standort konnte nicht ermittelt werden (Zugriff verweigert oder Timeout).",
        );
        setLocating(false);
      },
      { timeout: 10000 },
    );
  }

  function resetCoords() {
    setCoords(null);
  }

  return {
    locating,
    coords,
    current,
    forecast,
    loading,
    error,
    handleGeolocation,
    resetCoords,
  };
}
