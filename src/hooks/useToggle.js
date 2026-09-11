// useState für den Zustand, useCallback zum Einfrieren/Optimieren der Funktion
import { useState, useCallback } from "react";

// Custom Hook: Schalter für Wahr/Falsch-Werte (z. B. Modal auf/zu, Dark Mode an/aus)
// - initialValue: Startzustand (Standard: false = aus)
export default function useToggle(initialValue = false) {
  // Speichert den aktuellen Status (true oder false)
  const [value, setValue] = useState(initialValue);

  // Schalter-Funktion:
  // - useCallback: Merkt sich die Funktion im Speicher und erstellt sie beim Neu-Zeichnen (Re-Render) nicht jedes Mal neu
  // - [] (leeres Array): Funktion wird nur einmal beim Start erzeugt und bleibt stabil
  const toggle = useCallback(() => {
    // prev: Nimmt den direkten Vorgängerwert und kehrt ihn um (true -> false, false -> true)
    setValue((prev) => !prev);
  }, []);

  // Gibt den Wert, die Umschalt-Funktion und die direkte Setz-Funktion zurück
  return [value, toggle, setValue];
}