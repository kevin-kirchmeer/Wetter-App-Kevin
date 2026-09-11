import { Card, Flex, Heading, Text, Spinner } from "@radix-ui/themes";
import useWeather from "../hooks/useWeather";
import { HomeIcon } from "@radix-ui/react-icons";

export default function HomeCityCard({
  cityName = "Weilburg",
  glassCardStyle,
}) {
  // Eigene, unabhängige Instanz von useWeather:
  const { current, loading, error } = useWeather(cityName);

  return (
    <Card style={glassCardStyle} radius="medium" size="2">
      <Flex direction="column" gap="2" p="3">
        <Flex justify={{ initial: "center" }}>
          {
            <Flex justify={{ initial: "center" }} align={{initial: "center"}} gap="2">
              <HomeIcon></HomeIcon>
              <Heading size="3">{cityName}</Heading>
            </Flex>
          }
        </Flex>
        <Flex justify="between" align="center">
          {loading && <Spinner size="1" />}
        </Flex>

        {error && (
          <Text size="1" color="red">
            {error}
          </Text>
        )}

        {current && !loading && (
          <Flex align="center" justify="between" gap="4">
            <Flex align="center" gap="2">
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

            <Text size="6" weight="bold">
              {Math.round(current.main.temp)} °C
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
