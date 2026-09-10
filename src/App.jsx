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

import { useEffect, useState } from "react";
import {
  getCurrentWeather,
  getForecast,
  getCurrentWeatherByCoords,
  getForecastByCoords,
} from "./api/weatherApi";
import "./js/weatherBackground";
import { getWeatherBackground } from "./js/weatherBackground";

export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Berlin");
  const [coords, setCoords] = useState(null);
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        let weatherData;
        let forecastData;

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
        } else {
          weatherData = await getCurrentWeather(city, controller.signal);
          forecastData = await getForecast(city, controller.signal);
        }

        setCurrent(weatherData);
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
  }, [city, coords]);

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim() === "") return;
    setCoords(null);
    setCity(query.trim());
  }

  function handleGeolocation() {
    if (!navigator.geolocation) {
      setError("Standortermittlung wird von deinem Browser nicht unterstützt.");
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setError(
          "Standort konnte nicht ermittelt werden (Zugriff verweigert oder Timeout).",
        );
        setLocating(false);
      },
      { timeout: 10000 },
    );
  }

  const weatherTyp = current?.weather?.[0]?.main;
  const backgroundStyle = {
    background: getWeatherBackground(weatherTyp),
    minHeight: "100vh",
    transition: "background 0.8s ease",
  };

  const glassCardStyle = {
    // transparente Karte
    "--card-background-color": "rgba(255, 255, 255, 0.20)",
    backgroundColor: "rgba(255, 255, 255, 0.75) !important",
    backdropFilter: "blur(1px)",
    WebkitBackdropFilter: "blur(1px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  };

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
          <form onSubmit={handleSubmit}>
            <Theme radius="full">
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

          {/*     Location Weather       */}
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

      {loading && (
        <Box maxWidth="300px">
          <Progress />
        </Box>
      )}
      {error && <Text size="4">{error}</Text>}

      {current && (
        <Flex gap="5">
          <Card style={glassCardStyle} className="w-full">
            <Heading>
              {current.name}, {current.sys.country}
            </Heading>
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

      <Grid columns={{ initial: "2", md: "5" }} gap="3" width="auto">
        {forecast.map((day) => (
          <Card style={glassCardStyle} key={day.dt} radius="medium">
            <Flex justify="center" align="center" direction="column">
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
