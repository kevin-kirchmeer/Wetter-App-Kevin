// Hilfsfunktion importieren, die anhand des Wetterzustands den Hintergrund liefert
import { getWeatherBackground } from "../js/weatherBackground";

// Eigener Wetter-Hook zum Abrufen der Wetterdaten für die angegebene Stadt
import useWeather from "./useWeather";

// Custom Hook: Berechnet Style-Objekte basierend auf dem aktuellen Wetter
export default function useDynamicStyleWeatherBg(city) {
  // Wetterdaten für die Stadt laden
  const { current } = useWeather(city);

  // Wetterlage auslesen (z. B. "Rain", "Clear"); ?. verhindert Absturz bei null
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

  // Beide Style-Objekte zur Weiterverwendung zurückgeben
  return {
    backgroundStyle,
    glassCardStyle,
  };
}