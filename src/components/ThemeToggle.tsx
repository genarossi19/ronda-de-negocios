import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5 text-[#68A243]" />;
      case "dark":
        return <Moon className="h-5 w-5 text-[#68A243]" />;
      case "system":
        return <Monitor className="h-5 w-5 text-[#68A243]" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case "light":
        return "Modo claro - Click para oscuro";
      case "dark":
        return "Modo oscuro - Click para sistema";
      case "system":
        return "Sistema - Click para claro";
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10 rounded-lg border border-[#68A243]/20 hover:border-[#68A243] hover:bg-[#68A243]/10 transition-all duration-300 dark:border-[#68A243]/40 dark:hover:border-[#68A243]/60 dark:hover:bg-[#68A243]/20"
      title={getTooltip()}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {getIcon()}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
