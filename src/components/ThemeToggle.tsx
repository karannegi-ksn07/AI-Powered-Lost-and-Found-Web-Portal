"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: '24px', height: '24px' }} />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: "0.5rem",
        borderRadius: "var(--radius-md)",
      }}
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <Sun style={{ color: "var(--primary)" }} />
      ) : (
        <Moon style={{ color: "var(--primary)" }} />
      )}
    </button>
  );
}
