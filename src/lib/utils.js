// 1. Importiert das Hilfswerkzeug 'clsx'.
// Zweck: Erlaubt das bedingte Hinzufügen von CSS-Klassen (z. B. isActive && "bg-blue-500").
// Falsy-Werte wie false, null oder undefined werden dabei automatisch ignoriert.
import { clsx } from "clsx";

// 2. Importiert das Hilfswerkzeug 'twMerge' aus 'tailwind-merge'.
// Zweck: Erkennt und löst Tailwind-Klassenkonflikte auf (z. B. überschreibt "p-6" verlässlich "p-4").
import { twMerge } from "tailwind-merge";

// 3. 'export': Macht die Funktion für andere Dateien/Komponenten importierbar.
// 'function cn': Namensgebung als Abkürzung für 'classNames'.
// '...inputs': Der Rest-Parameter sammelt alle übergebenen Argumente (Strings, Objekte, Arrays) in einem Array.
export function cn(...inputs) {
  // 4. Schritt 1 (innen): clsx(inputs) wertet Bedingungen aus und baut einen zusammenhängenden String.
  // 5. Schritt 2 (außen): twMerge(...) prüft den String auf kollidierende Tailwind-Klassen und entfernt Duplikate/Konflikte.
  // 6. 'return': Gibt den fertig bereinigten Klassen-String für das className-Attribut zurück.
  return twMerge(clsx(inputs));
}