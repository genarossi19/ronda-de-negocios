import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-lg border border-[#68A243]/20 hover:border-[#68A243] hover:bg-[#68A243]/10 transition-all duration-300"
      title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`h-5 w-5 text-[#68A243] absolute transition-all duration-300 ${
            theme === "light"
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-90 opacity-0"
          }`}
        />
        <Moon
          className={`h-5 w-5 text-[#68A243] absolute transition-all duration-300 ${
            theme === "dark"
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-90 opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
