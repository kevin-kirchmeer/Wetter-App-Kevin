
export function getWeatherBackground(weatherMain) {
  switch (weatherMain) {
    case "Clear":
      // Sonnig / Klar: Warmer Himmel
      return "linear-gradient(135deg, #38bdf8 0%, #f59e0b 100%)";
    case "Rain":
    case "Drizzle":
      // Regen: Kühles Blau-Grau
      return "linear-gradient(135deg, #475569 0%, #1e293b 100%)";
    case "Clouds":
      // Bewölkt: Sanftes Grau-Blau
      return "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)";
    case "Snow":
      // Schnee: Helles Eisblau
      return "linear-gradient(135deg, #bae6fd 0%, #e0f2fe 100%)";
    case "Thunderstorm":
      // Gewitter: Dunkles Violett-Grau
      return "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)";
    default:
      // Standard: Frischer Himmel
      return "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)";
  }
}