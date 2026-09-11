// React Hooks importieren: useState (Wert speichern) & useEffect (Timer verwalten)
import { useState, useEffect } from "react";

// Custom Hook zur Verzögerung von Werteänderungen (z. B. Suchanfragen beim Tippen):
// - value: Der Wert, der sich schnell ändern kann (z. B. Tastatureingabe)
// - delay = 500: Wartezeit in Millisekunden (Standard: 500 ms = 0,5 Sekunden)
export default function useDebounce(value, delay = 500) {
    // Speichert den verzögerten Wert (startet mit dem Anfangswert)
    const [debounceValue, setDebounceValue] = useState(value);

    // useEffect reagiert jedes Mal, wenn sich value oder delay ändert
    useEffect(() => {
        // Startet einen Countdown: Aktualisiert den State erst nach Ablauf von delay ms
        const timer = setTimeout(() => {
           setDebounceValue(value);
        }, delay); // Korrigiert: delay als Zahl übergeben (ohne eckige Klammern)

        // Cleanup-Funktion: Löscht den laufenden Timer, falls der Nutzer vor Ablauf weitertippt
        return () => clearTimeout(timer);
    }, [value, delay]); // Triggert neu, sobald sich der getippte Wert oder die Wartezeit ändert

    // Gibt den verzögerten Wert zurück (die App nutzt diesen für API-Aufrufe)
    return debounceValue;
}