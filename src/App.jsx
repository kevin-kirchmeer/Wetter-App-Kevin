import {
  Flex,
  Heading,
  Text,
  Grid,
  Card,
  Theme,
  TextField,
  Button,
  Box,
  Progress,
} from "@radix-ui/themes";

import { Crosshair2Icon } from "@radix-ui/react-icons";

// React Hooks: useState (Speicher) & useEffect (Nebeneffekte/Laden)
import { useEffect, useState } from "react";

// Hilfsfunktionen für API-Aufrufe importieren
import {
  getCurrentWeather,
  getForecast,
  getCurrentWeatherByCoords,
  getForecastByCoords,
} from "./api/weatherApi";

// Hintergrund-Logik je nach Wetterlage importieren
import "./js/weatherBackground";
import { getWeatherBackground } from "./js/weatherBackground";

export default function App() {
  // --- STATES (Das Gedächtnis der Komponente) ---
  const [query, setQuery] = useState(""); // Merkt sich die aktuelle Eingabe im Suchfeld
  const [city, setCity] = useState("Berlin"); // Aktive Stadt für die API-Abfrage (Start: Berlin)
  const [coords, setCoords] = useState(null); // GPS-Daten: { lat, lon } oder null
  const [current, setCurrent] = useState(null); // Speichert die empfangenen aktuellen Wetterdaten
  const [forecast, setForecast] = useState([]); // Speichert die 5-Tage-Vorhersage als Array
  const [loading, setLoading] = useState(false); // Ampel: Lädt die App gerade Daten? (true/false)
  const [locating, setLocating] = useState(false); // Ampel: Sucht das Gerät gerade GPS? (true/false)
  const [error, setError] = useState(null); // Speichert Fehlermeldungen für den Nutzer

  // --- USEEFFECT (Reagiert auf Änderungen von city oder coords) ---
  useEffect(() => {
    // Not-Aus-Schalter: Bricht veraltete Netzwerkanfragen ab
    const controller = new AbortController();

    async function load() {
      setLoading(true); // Ladebalken aktivieren
      setError(null); // Alten Fehler zurücksetzen

      try {
        let weatherData;
        let forecastData;

        // Fall 1: GPS-Koordinaten vorhanden -> Wetter per Koordinaten laden
        if (coords) {
          weatherData = await getCurrentWeatherByCoords(
            coords.lat,
            coords.lon,
            controller.signal,
          );
          forecastData = await getForecastByCoords(
            coords.lat,
            coords.lon,
            controller.signal,
          );
        // Fall 2: Keine GPS-Daten -> Wetter per Stadtname laden
        } else {
          weatherData = await getCurrentWeather(city, controller.signal);
          forecastData = await getForecast(city, controller.signal);
        }

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

  // --- EVENT HANDLER (Aktionen des Nutzers) ---

  // Formular absenden (Suche)
  function handleSubmit(e) {
    e.preventDefault(); // Verhindert Seiten-Reload durch das Formular
    if (query.trim() === "") return; // Leere Eingaben ignorieren
    setCoords(null); // GPS-Modus deaktivieren, da nach Stadt gesucht wird
    setCity(query.trim()); // Neue Stadt setzen -> triggert useEffect
  }

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

  // --- DYNAMISCHE WERTE & STYLES ---
  // ?. (Optional Chaining): Verhindert Absturz, falls current noch null ist
  const weatherTyp = current?.weather?.[0]?.main;
  const backgroundStyle = {
    background: getWeatherBackground(weatherTyp),
    minHeight: "100vh",
    transition: "background 0.8s ease",
  };

  const glassCardStyle = {
    "--card-background-color": "rgba(255, 255, 255, 0.20)",
    backgroundColor: "rgba(255, 255, 255, 0.75) !important",
    backdropFilter: "blur(1px)",
    WebkitBackdropFilter: "blur(1px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  };

  // --- RENDERING (JSX) ---
  return (
    <Flex direction="column" p="5" gap="6" style={backgroundStyle}>
      <Flex
        justify={{ initial: "start", md: "between" }}
        align={{ initial: "center" }}
        direction={{ initial: "column", md: "row" }}
        gap="5"
      >
        <Flex align="end">
          <Heading>AEON</Heading>
          <Text size="2">Himmelsprotokoll</Text>
        </Flex>

        <Flex
          gap="2"
          justify={{ initial: "center" }}
          align={{ initial: "center" }}
        >
          {/* onSubmit ruft handleSubmit auf (Enter oder Klick auf Button) */}
          <form onSubmit={handleSubmit}>
            <Theme radius="full">
              {/* Controlled Component: value bindet an query, onChange updatet query */}
              <TextField.Root
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="3"
                placeholder="Stadt suchen..."
              >
                <TextField.Slot side="right" px="1">
                  <Button type="submit" size="2">
                    Suchen
                  </Button>
                </TextField.Slot>
              </TextField.Root>
            </Theme>
          </form>

          {/* GPS-Button: Ruft handleGeolocation auf, deaktiviert während der Suche */}
          <Theme radius="full">
            <Button
              type="button"
              variant="soft"
              onClick={handleGeolocation}
              disabled={locating}
            >
              {locating ? "Suche..." : <Crosshair2Icon />}
            </Button>
          </Theme>
        </Flex>
      </Flex>

      {/* Bedingtes Rendering: Progress Bar nur anzeigen wenn loading === true */}
      {loading && (
        <Box maxWidth="300px">
          <Progress />
        </Box>
      )}

      {/* Bedingtes Rendering: Text nur anzeigen wenn ein Fehlertext existiert */}
      {error && <Text size="4">{error}</Text>}

      {/* Aktuelle Wetterkarte: Nur anzeigen wenn Daten geladen wurden (current !== null) */}
      {current && (
        <Flex gap="5">
          <Card style={glassCardStyle} className="w-full">
            <Heading>
              {current.name}, {current.sys.country}
            </Heading>
            {/* Math.round: Rundet Dezimalwerte auf ganze Grad Celsius */}
            <Text>{Math.round(current.main.temp)} °C</Text>
            {current.weather?.[0]?.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                alt={current.weather[0].description}
                style={{ width: 80, height: 80 }}
              />
            )}
            <Text>Wind: {current.wind.speed} m/s</Text>
          </Card>
        </Flex>
      )}

      {/* Vorhersage-Grid: .map() läuft durch das Array und rendert für jeden Tag eine Card */}
      <Grid columns={{ initial: "2", md: "5" }} gap="3" width="auto">
        {forecast.map((day) => (
          // key={day.dt}: Eindeutige ID für React zur Render-Optimierung
          <Card style={glassCardStyle} key={day.dt} radius="medium">
            <Flex justify="center" align="center" direction="column">
              {/* Formatiert den Datums-String in den deutschen Wochentag (z. B. "Mo") */}
              <Text>
                {new Date(day.dt_txt).toLocaleDateString("de-DE", {
                  weekday: "short",
                })}
              </Text>
              <Text>{Math.round(day.main.temp)} °C</Text>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt={day.weather[0].description}
                style={{ width: 80, height: 80 }}
              />
              <Text size="2">{day.weather[0].description}</Text>
            </Flex>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}