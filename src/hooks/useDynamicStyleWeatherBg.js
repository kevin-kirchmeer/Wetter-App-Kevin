// Hintergrund-Logik je nach Wetterlage importieren
import { getWeatherBackground } from "../js/weatherBackground";
import useWeather from "./useWeather";


export default function useDynamicStyleWeatherBg(city) {

    const { current } = useWeather(city);

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

      return {
        backgroundStyle,
        glassCardStyle,
      };

}
