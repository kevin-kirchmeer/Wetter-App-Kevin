import {
  Flex,
  Heading,
  Text,
  Grid,
  Card,
  Theme,
  TextField,
  Button,
  Progress,
} from "@radix-ui/themes";

import { Crosshair2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

// Eigene Custom Hooks & Komponenten importieren
import useWeather from "./hooks/useWeather";
import useDebounce from "./hooks/useDebounce";
import useDynamicStyleWeatherBg from "./hooks/useDynamicStyleWeatherBg";
import HomeCityCard from "./components/HomeCityCard";
import useToggle from "./hooks/useToggle";
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App() {
  // --- STATES & SPEICHER ---
  const [query, setQuery] = useState(""); // Merkt sich Zeichen für Zeichen die Texteingabe im Suchfeld
  const [city, setCity] = useLocalStorage("lastCity", "Berlin"); // Speichert gesuchte Stadt dauerhaft im Browser (Startwert: Berlin)

  // Einheiten-Umschalter (°C / °F):
  // - isFahrenheit: false = Celsius, true = Fahrenheit
  // - toggleUnit: Funktion zum Hin- und Herschalten
  const [isFahrenheit, toggleUnit] = useToggle(false);
  const units = isFahrenheit ? "imperial" : "metric"; // API-Parameter: imperial (Fahrenheit) oder metric (Celsius)
  const unitSymbol = isFahrenheit ? "°F" : "°C"; // Passendes Anzeigesymbol für die Temperatur
  const windUnit = isFahrenheit ? "mph" : "m/s"; // Passende Einheit für Windgeschwindigkeit

  // useWeather: Holt Wetterdaten, Vorhersage, Ladezustand und GPS-Funktionen
  const {
    locating,
    current,
    forecast,
    loading,
    error,
    handleGeolocation,
    resetCoords,
  } = useWeather(city, units);

  // useDynamicStyleWeatherBg: Liefert Hintergrund- und Glas-Styles passend zum aktuellen Wetter
  const { backgroundStyle, glassCardStyle } = useDynamicStyleWeatherBg(city);

  // useDebounce: Wartet 500ms nach dem letzten Tastendruck, bevor der Wert übernommen wird (schont die API)
  const debouncedQuery = useDebounce(query, 500);

  // --- EVENT HANDLER & EFFEKTE ---

  // Manuelles Absenden des Formulars (z. B. per Enter oder Klick auf "Suchen")
  function handleSubmit(e) {
    e.preventDefault(); // Verhindert Neuladen der gesamten Webseite
    if (query.trim() === "") return; // Leere Eingaben ignorieren
    resetCoords(); // Vorherige GPS-Koordinaten verwerfen, da manuell gesucht wird
    setCity(query.trim()); // Neue Stadt setzen -> triggert automatischen Datenabruf
  }

  // Automatische Suche bei Texteingabe (nach Ablauf des 500ms-Timers)
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    // Erst ab 3 Buchstaben suchen und nur, wenn es nicht schon die aktive Stadt ist
    if (trimmed.length >= 3 && trimmed !== city) {
      resetCoords(); // GPS-Koordinaten verwerfen
      setCity(trimmed); // Stadt aktualisieren
    }
  }, [debouncedQuery, city, resetCoords, setCity]);

  // --- RENDERING (JSX) ---
  return (
    <Flex direction="column" p="5" gap="6" style={backgroundStyle}>
      {/* Kopfbereich: Logo/Titel & Steuerungsleiste */}
      <Flex
        justify={{ initial: "start", md: "between" }}
        align={{ initial: "center" }}
        direction={{ initial: "column", md: "row" }}
        gap="5"
      >
        <Flex align="end">
          <Heading weight="bold" style={{ color: "white" }}>
            ZEUS
          </Heading>
          <Text size="2" weight="light" style={{ color: "white" }}>
            Himmelsprotokoll
          </Text>
        </Flex>

        <Flex gap="2" justify="center" align="center">
          {/* Umschalt-Button für Temperatur-Einheit (°C / °F) */}
          <Theme radius="full">
            <Button
              type="button"
              onClick={toggleUnit}
              style={{ cursor: "pointer", minWidth: "48px" }}
            >
              {isFahrenheit ? "°F" : "°C"}
            </Button>
          </Theme>

          <Flex
            gap="2"
            justify={{ initial: "center" }}
            align={{ initial: "center" }}
          >
            {/* Formular für Stadtsuche */}
            <form onSubmit={handleSubmit}>
              <Theme radius="full">
                {/* Controlled Input: Wert hängt an State 'query', Aktualisierung bei Tastendruck */}
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

            {/* GPS-Standort-Button: Deaktiviert, solange Standort ermittelt wird */}
            <Theme radius="full">
              <Button
                type="button"
                onClick={handleGeolocation}
                disabled={locating}
              >
                {locating ? "Suche..." : <Crosshair2Icon />}
              </Button>
            </Theme>
          </Flex>
        </Flex>
      </Flex>

      {/* Feste Heimatstadt-Karte (lädt unabhängig eigene Wetterdaten für Weilburg) */}
      <HomeCityCard
        cityName="Weilburg"
        glassCardStyle={glassCardStyle}
        units={units}
        unitSymbol={unitSymbol}
      />

      {/* Ladebalken: Nur sichtbar, solange Daten über useWeather geladen werden */}
      {loading && (
        <Flex justify={{ initial: "center" }} align={{ initial: "center" }}>
          <Progress />
        </Flex>
      )}

      {/* Fehleranzeige: Zeigt Fehlermeldung als Text an, falls vorhanden */}
      {error && <Text size="4">{error}</Text>}

      {/* Haupt-Wetteranzeige: Wird nur gerendert, wenn Wetterdaten vorhanden sind (current !== null) */}
      {current && (
        <Flex
          gap="2"
          p={{ initial: "4", md: "9" }}
          direction={{ initial: "column", md: "row" }}
          align={{ initial: "center" }}
          justify={{ initial: "between" }}
        >
          <Heading size="8">
            {current.name}, {current.sys.country}
          </Heading>

          <Flex direction={{ initial: "column" }} align={{ initial: "center" }}>
            <Flex
              justify={{ initial: "center" }}
              direction={{ initial: "column" }}
              align={{ initial: "center" }}
            >
              {/* Optional Chaining (?.): Verhindert Absturz bei fehlendem Wetter-Array */}
              {current.weather?.[0]?.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                  alt="Weather Icon"
                  style={{ width: 80, height: 80 }}
                />
              )}
              {/* Math.round: Rundet Temperatur auf ganze Zahlen */}
              <Text size="8" weight="bold">
                {Math.round(current.main.temp)} {unitSymbol}
              </Text>
            </Flex>
            <Text size="2">{current.weather[0].description}</Text>
            <Text>Wind: {current.wind.speed} {windUnit}</Text>
          </Flex>
        </Flex>
      )}

      {/* 5-Tage-Vorhersage: Rendert per .map() für jeden Vorhersage-Eintrag eine eigene Karte */}
      <Grid columns={{ initial: "1", md: "5" }} gap="3" width="auto">
        {forecast.map((day) => (
          // key={day.dt}: Eindeutiger Zeitstempel als Schlüssel für React
          <Card style={glassCardStyle} key={day.dt} radius="medium">
            <Flex justify="center" align="center" direction="column">
              {/* Wandelt Datums-String in deutschen Wochentag um (z. B. "Mo", "Di") */}
              <Text>
                {new Date(day.dt_txt).toLocaleDateString("de-DE", {
                  weekday: "short",
                })}
              </Text>
              <Text>{Math.round(day.main.temp)} {unitSymbol}</Text>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt="weather icon"
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