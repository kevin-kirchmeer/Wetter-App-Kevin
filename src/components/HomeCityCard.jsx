// Radix UI Komponenten für Layout, Textanzeige und Ladeanimation importieren
import { Card, Flex, Heading, Text, Spinner } from "@radix-ui/themes";

// Eigener Custom Hook zum automatischen Laden der Wetterdaten
import useWeather from "../hooks/useWeather";

// Haus-Icon für die optische Kennzeichnung der Heimatstadt importieren
import { HomeIcon } from "@radix-ui/react-icons";

// Komponenten-Funktion mit Props & Standardwerten (Default Props):
// - cityName: Name der Stadt (Standard: "Weilburg")
// - glassCardStyle: Styling-Objekt für den Frosted-Glass-Effekt
// - units: API-Einheit ("metric" für Celsius, "imperial" für Fahrenheit)
// - unitSymbol: Textzeichen für die Anzeige (Standard: "°C")
export default function HomeCityCard({
  cityName = "Weilburg",
  glassCardStyle,
  units = "metric",
  unitSymbol = "°C",
}) {
  // Custom Hook aufrufen:
  // - Lädt eigenständig die Daten für diese spezifische Stadt
  // - Gibt die Zustände current (Wetterdaten), loading (Ladezustand) und error (Fehlertext) zurück
  const { current, loading, error } = useWeather(cityName, units);

  return (
    <Card style={glassCardStyle} radius="medium" size="2">
      <Flex direction="column" gap="2" p="3">
        {/* Kopfbereich der Karte: Zentriertes Haus-Icon mit dem Stadtnamen */}
        <Flex justify={{ initial: "center" }}>
          <Flex justify={{ initial: "center" }} align={{ initial: "center" }} gap="2">
            <HomeIcon />
            <Heading size="3">{cityName}</Heading>
          </Flex>
        </Flex>

        {/* Ladeanzeige: Zeigt den Spinner nur, solange loading === true ist */}
        <Flex justify="between" align="center">
          {loading && <Spinner size="1" />}
        </Flex>

        {/* Fehleranzeige: Wird nur gerendert, wenn useWeather einen Fehler meldet */}
        {error && (
          <Text size="1" color="red">
            {error}
          </Text>
        )}

        {/* Hauptinhalt: Nur rendern, wenn Daten vorhanden sind (current) UND der Ladevorgang beendet ist (!loading) */}
        {current && !loading && (
          <Flex align="center" justify="between" gap="4">
            {/* Linke Seite: Wetter-Icon + Beschreibung + Windstärke */}
            <Flex align="center" gap="2">
              {/* Optional Chaining (?.): Verhindert Absturz, falls die API-Datenstruktur unvollständig ist */}
              {current.weather?.[0]?.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${current.weather[0].icon}.png`}
                  alt={current.weather[0].description}
                  style={{ width: 44, height: 44 }}
                />
              )}
              <Flex direction="column">
                <Text size="2" weight="medium">
                  {current.weather[0].description}
                </Text>
                <Text size="1" color="gray">
                  Wind: {current.wind.speed} m/s
                </Text>
              </Flex>
            </Flex>

            {/* Rechte Seite: Gerundete Temperatur + dynamische Einheit (°C oder °F) */}
            <Text size="6" weight="bold">
              {Math.round(current.main.temp)} {unitSymbol}
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}