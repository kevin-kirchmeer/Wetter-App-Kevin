import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* Mit dieser Funktion kannst du überall in deinen Komponenten Klassen sauber zusammensetzen, z. B. cn("p-4 rounded-xl bg-white/10", isActive && "border border-white/40"). */