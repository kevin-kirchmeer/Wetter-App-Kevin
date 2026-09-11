// Hilfsfunktionen für API-Aufrufe importieren
import {
  getCurrentWeather,
  getForecast,
  getCurrentWeatherByCoords,
  getForecastByCoords,
} from "../api/weatherApi";

// React Hooks: useState (Zustand speichern) & useEffect (Nebeneffekte/Daten laden)
import { useEffect, useState } from "react";

// Custom Hook: Verwaltet den gesamten Datenabruf und Status für Wetter & GPS
// - city: Name der gesuchten Stadt
// - units: Einheit ("metric" für Celsius, "imperial" für Fahrenheit)
export default function useWeather(city, units = "metric") {
  // --- STATES (Das Gedächtnis der Komponente) ---
  const [current, setCurrent] = useState(null); // Aktuelles Wetter (Temperatur, Wind etc.)
  const [forecast, setForecast] = useState([]); // Array der 5-Tage-Vorhersage
  const [loading, setLoading] = useState(false); // Ampel: Zeigt an, ob Daten geladen werden
  const [error, setError] = useState(null); // Text für Fehlermeldungen (sonst null)
  const [locating, setLocating] = useState(false); // Ampel: Zeigt an, ob GPS aktiv sucht
  const [coords, setCoords] = useState(null); // GPS-Objekt { lat, lon } oder null

  // --- USEEFFECT (Reagiert auf Änderungen von city, coords oder units) ---
  useEffect(() => {
    // Erzeugt Abbruch-Signal für laufende fetch-Aufrufe
    const controller = new AbortController();

    async function load() {
      setLoading(true); // Ladezustand starten
      setError(null); // Alten Fehler zurücksetzen

      try {
        // Promise.all: Startet beide API-Anfragen parallel statt nacheinander
        // Ternary Operator (? :): Prüft, ob GPS-Koordinaten vorliegen oder nach Stadt gesucht wird
        const [weatherData, forecastData] = await (coords
          ? Promise.all([
              getCurrentWeatherByCoords(
                coords.lat,
                coords.lon,
                controller.signal,
                units,
              ),
              getForecastByCoords(
                coords.lat,
                coords.lon,
                controller.signal,
                units,
              ),
            ])
          : Promise.all([
              getCurrentWeather(city, controller.signal, units),
              getForecast(city, controller.signal, units),
            ]));

        // Aktuelle Daten im State ablegen
        setCurrent(weatherData);

        // Filter: Nur die Einträge für 12:00 Uhr mittags in die Vorhersage übernehmen
        setForecast(
          forecastData.list.filter((item) => item.dt_txt.includes("12:00:00")),
        );
      } catch (error) {
        // Nur echte Fehler speichern (manuell abgebrochene Anfragen ignorieren)
        if (error.name !== "AbortError") setError(error.message);
      } finally {
        setLoading(false); // Ladezustand beenden (sowohl bei Erfolg als auch bei Fehler)
      }
    }

    load();

    // Cleanup-Funktion: Bricht offene Requests ab, wenn sich Abhängigkeiten ändern
    return () => controller.abort();
  }, [city, coords, units]); // Feuert neu, wenn Stadt, Koordinaten oder Einheit wechseln

  // GPS-Standort ermitteln
  function handleGeolocation() {
    // Prüfen, ob der Browser Standortabfragen unterstützt
    if (!navigator.geolocation) {
      setError("Standortermittlung wird von deinem Browser nicht unterstützt.");
      return;
    }

    setLocating(true); // GPS-Suche aktivieren
    setError(null); // Alten Fehler löschen

    // GPS-Koordinaten vom Browser anfordern
    navigator.geolocation.getCurrentPosition(
      // Erfolg: Koordinaten setzen -> triggert useEffect
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocating(false);
      },
      // Fehler: Zugriff verweigert oder Timeout nach 10 Sekunden
      () => {
        setError(
          "Standort konnte nicht ermittelt werden (Zugriff verweigert oder Timeout).",
        );
        setLocating(false);
      },
      { timeout: 10000 },
    );
  }

  // Setzt die Koordinaten auf null zurück (z. B. wenn der Nutzer wieder nach einer Stadt sucht)
  function resetCoords() {
    setCoords(null);
  }

  // Gibt alle Werte und Steuerungs-Funktionen für andere Komponenten frei
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