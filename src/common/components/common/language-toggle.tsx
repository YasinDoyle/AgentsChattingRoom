import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { cn } from "@/common/lib/utils";
import { Globe } from "lucide-react";
import { useTranslation } from "@/core/hooks/use-i18n";

interface LanguageToggleProps {
  className?: string;
  expanded?: boolean;
}

const languages = [
  { code: "zh-CN", label: "简体中文", nativeLabel: "简体中文" },
  { code: "en-US", label: "English", nativeLabel: "English" },
] as const;

export function LanguageToggle({ className, expanded }: LanguageToggleProps) {
  const { t, currentLanguage, changeLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          title={t("settings.language.label")}
          className={cn(
            "flex items-center rounded-md mx-2 px-3 py-2 cursor-pointer",
            "transition-colors duration-150 outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring",
            "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            className,
          )}
        >
          <div className="flex-shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <span
            className={cn(
              "ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200",
              expanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0 ml-0",
            )}
          >
            {t("settings.language.label")}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="min-w-[120px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "cursor-pointer",
              currentLanguage === lang.code && "bg-accent font-medium",
            )}
          >
            <span className="flex items-center justify-between w-full">
              <span>{lang.nativeLabel}</span>
              {currentLanguage === lang.code && (
                <span className="text-xs">✓</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
