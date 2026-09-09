import { Flex, Heading, Text, Grid } from "@radix-ui/themes";
import { useEffect, useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Weilburg");

  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    async function load() {
      const weather = await getCurrentWeather(city);
      const forecastData = await getForecast(city);

      setCurrent(weather);
      // aus den 3-Stunden-Schritten nur den Mittagswert je Tag herauspicken:
      setForecast(
        forecastData.list.filter((item) => item.dt_txt.includes("12:00:00")),
      );
    }
    load();
  }, [city]);

  {
    current && (
      <Flex>
        <Heading>
          {current.name}, {current.sys.country}
        </Heading>
        <Text>{Math.round(current.main.temp)} °C</Text>
        <Text>{current.weather[0].description}</Text>
        <Text>Wind: {current.wind.speed} m/s</Text>
      </Flex>
    );
  }

  <Grid columns="2" md:columns="5" gap="3">
    {forecast.map((day) => (
      <Flex key={day.dt} radius="medium">
        <Text>
          {new Date(day.dt_txt).toLocaleDateString("de-DE", {
            weekday: "short",
          })}
        </Text>
        <Text>{Math.round(day.main.temp)} °C</Text>
        <Text size="2">{day.weather[0].description}</Text>
      </Flex>
    ))}
  </Grid>;

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
    </Flex>
  );
}
