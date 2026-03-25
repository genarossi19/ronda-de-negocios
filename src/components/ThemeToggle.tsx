import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
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
        return "Modo claro";
      case "dark":
        return "Modo oscuro";
      case "system":
        return "Por defecto del sistema";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-lg border border-transparent hover:border-[#68A243]/40 hover:bg-[#68A243]/10 transition-all duration-300 dark:hover:border-[#68A243]/60 dark:hover:bg-[#68A243]/20"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              {getIcon()}
            </div>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltip()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
