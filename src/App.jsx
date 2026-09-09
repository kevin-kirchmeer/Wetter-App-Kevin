import { Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Weilburg");

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim() === "") return;
    setCity(query.trim());
  }

  return (
    <Flex direction="column">
      <form onSubmit={handleSubmit}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Stadt suchen..."/>
        <button type="submit">Suchen</button>
      </form>
      <Heading>{city}</Heading>
    </Flex>
  );
}
