import { useState, useEffect } from "react";

// Custom Hook: Funktioniert wie useState, speichert Daten aber dauerhaft im Browser (LocalStorage)
// - key: Der eindeutige Schlüsselname im Speicher (z. B. "weather_city")
// - initialValue: Der Standardwert, falls noch nichts im Speicher liegt
export function useLocalStorage(key, initialValue) {
    // Lazy Initialization: Die Funktion läuft nur einmalig beim ersten Laden der Komponente
    const [value, setValue] = useState(() => {
        // Prüfen, ob unter diesem Schlüssel bereits ein Wert im Browser existiert
        const saved = localStorage.getItem(key);
        // Wenn vorhanden: Text (JSON) wieder in JavaScript umwandeln; sonst Standardwert nutzen
        return saved !== null ? JSON.parse(saved) : initialValue;
    });

    // useEffect reagiert jedes Mal, wenn sich der Wert (value) oder der Schlüssel (key) ändert
    useEffect(() => {
        // Schreibt den aktuellen Wert als Text (JSON-String) in den LocalStorage
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]); // Dependency-Array: Triggert den Speichervorgang bei jeder Änderung

    // Gibt den Wert und die Update-Funktion zurück – genau wie das normale useState
    return [value, setValue];
}