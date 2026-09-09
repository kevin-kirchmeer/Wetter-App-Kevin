import { Flex, Heading, Text, Grid, Card } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getCurrentWeather, getForecast } from "./api/weatherApi";


export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Berlin");

  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const weather = await getCurrentWeather(city);
        const forecastData = await getForecast(city);

        setCurrent(weather);
        // aus den 3-Stunden-Schritten nur den Mittagswert je Tag herauspicken:
        setForecast(
          forecastData.list.filter((item) => item.dt_txt.includes("12:00:00")),
        );
      } catch (error) {
        // ein abgebrochener Request ist kein echter Fehler
        if (error.name !== "AbortError") setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [city]);

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim() === "") return;
    setCity(query.trim());
  }

  return (
    <Flex direction="column">
      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Stadt suchen..."
        />
        <button type="submit">Suchen</button>
      </form>

      {loading && <Text size="4">Laden...</Text>}
      {error && <Text size="4">{error}</Text>}

      {current && (
        <Flex>
          <Heading>
            {current.name}, {current.sys.country}
          </Heading>
          <Text>{Math.round(current.main.temp)} °C</Text>
          <Text>{current.weather[0].description}</Text>
          <Text>Wind: {current.wind.speed} m/s</Text>
        </Flex>
      )}

      <Grid columns={{initial: "2", md: "5"}} gap="3">
        {forecast.map((day) => (
          <Card key={day.dt} radius="medium">
            <Text>
              {new Date(day.dt_txt).toLocaleDateString("de-DE", {
                weekday: "short",
              })}
            </Text>
            <Text>{Math.round(day.main.temp)} °C</Text>
            <Text size="2">{day.weather[0].description}</Text>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}
