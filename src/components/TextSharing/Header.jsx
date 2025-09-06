import React, { useState, useEffect } from "react";
import { Lock, Sun, Moon } from "lucide-react";

export default function Header() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setIsDark(next === "dark");
  };

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl p-2 bg-secondary ring-1 ring-border">
          <Lock className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl md:text-[28px] tracking-tight font-semibold">
            Secure Text Share
          </h1>
          <p className="text-sm text-muted-foreground">
            Encrypt and share your messages securely.
          </p>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="rounded-xl p-2 bg-secondary hover:bg-muted border border-border transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </header>
  );
}
