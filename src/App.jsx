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
import useWeather from "./hooks/useWeather";
import useDebounce from "./hooks/useDebounce";
import useDynamicStyleWeatherBg from "./hooks/useDynamicStyleWeatherBg";
import HomeCityCard from "./components/HomeCityCard";

// Speichern der letzten Eingabe von City
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App() {
  // --- STATES (Das Gedächtnis der Komponente) ---
  const [query, setQuery] = useState(""); // Merkt sich die aktuelle Eingabe im Suchfeld
  const [city, setCity] = useLocalStorage("lastCity", "Berlin"); // Aktive Stadt für die API-Abfrage (Start: Berlin) // Jetzt: Speichert die letzte Eingegebene Stadt

  const {
    locating,
    current,
    forecast,
    loading,
    error,
    handleGeolocation,
    resetCoords,
  } = useWeather(city);
  const { backgroundStyle, glassCardStyle } = useDynamicStyleWeatherBg(city);

  // Debounced Query (aktualisiert sich erst 500ms nach dem letzten Tastendruck)
  const debouncedQuery = useDebounce(query, 500);

  // --- EVENT HANDLER (Aktionen des Nutzers) ---

  // Formular absenden (Suche)
  function handleSubmit(e) {
    e.preventDefault(); // Verhindert Seiten-Reload durch das Formular
    if (query.trim() === "") return; // Leere Eingaben ignorieren
    resetCoords(); // GPS-Modus deaktivieren, da nach Stadt gesucht wird
    setCity(query.trim()); // Neue Stadt setzen -> triggert useEffect
  }

  // Sobald debouncedQuery stabil ist, aktualisieren wir city
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    // Mindestens 3 Zeichen verhindern unnötige 404-Fehler bei kurzen Fragmenten
    if (trimmed.length >= 3 && trimmed !== city) {
      resetCoords(); // GPS-Modus deaktivieren, da getippt wurde
      setCity(trimmed);
    }
  }, [debouncedQuery, city, resetCoords, setCity]);

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
          <Heading weight="bold" style={{ color: "white" }}>
            ZEUS
          </Heading>
          <Text size="2" weight="light" style={{ color: "white" }}>
            Himmelsprotokoll
          </Text>
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
              onClick={handleGeolocation}
              disabled={locating}
            >
              {locating ? "Suche..." : <Crosshair2Icon />}
            </Button>
          </Theme>
        </Flex>
      </Flex>
      
      <HomeCityCard cityName="Weilburg" glassCardStyle={glassCardStyle} />

      {/* Bedingtes Rendering: Progress Bar nur anzeigen wenn loading === true */}
      {loading && (
        <Flex justify={{ initial: "center" }} align={{ initial: "center" }}>
          <Progress />
        </Flex>
      )}

      {/* Bedingtes Rendering: Text nur anzeigen wenn ein Fehlertext existiert */}
      {error && <Text size="4">{error}</Text>}

      {/* Aktuelle Wetterkarte: Nur anzeigen wenn Daten geladen wurden (current !== null) */}
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
              {current.weather?.[0]?.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                  alt="Weather Icon"
                  style={{ width: 80, height: 80 }}
                />
              )}
              <Text size="8" weight="bold">
                {Math.round(current.main.temp)} °C
              </Text>
            </Flex>
            <Text size="2">{current.weather[0].description}</Text>
            {/* Math.round: Rundet Dezimalwerte auf ganze Grad Celsius */}
            <Text>Wind: {current.wind.speed} m/s</Text>
          </Flex>
        </Flex>
      )}

      {/* Vorhersage-Grid: .map() läuft durch das Array und rendert für jeden Tag eine Card */}
      <Grid columns={{ initial: "1", md: "5" }} gap="3" width="auto">
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
