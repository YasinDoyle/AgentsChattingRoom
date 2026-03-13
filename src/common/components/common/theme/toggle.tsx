import { cn } from "@/common/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./context";
import { useTranslation } from "@/core/hooks/use-i18n";

interface ThemeToggleProps {
  className?: string;
  expanded?: boolean;
}

export function ThemeToggle({ className, expanded }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const label = isDarkMode ? t("theme.switchToLight") : t("theme.switchToDark");

  return (
    <div
      role="button"
      tabIndex={0}
      title={label}
      onClick={toggleDarkMode}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleDarkMode();
        }
      }}
      className={cn(
        "flex items-center rounded-md mx-2 px-3 py-2 cursor-pointer",
        "transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        className,
      )}
    >
      <div className="flex-shrink-0">
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </div>
      <span
        className={cn(
          "ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200",
          expanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0 ml-0",
        )}
      >
        {label}
      </span>
    </div>
  );
}
