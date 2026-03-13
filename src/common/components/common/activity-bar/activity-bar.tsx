"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/common/lib/utils";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

/* ─── Context ─── */

interface ActivityBarContextValue {
  expanded: boolean;
  activeId?: string;
  onActiveChange?: (id: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

const ActivityBarContext = createContext<ActivityBarContextValue>({
  expanded: false,
});

function useActivityBar() {
  return useContext(ActivityBarContext);
}

/* ─── Root ─── */

interface RootProps {
  expanded: boolean;
  activeId?: string;
  expandedWidth?: number;
  collapsedWidth?: number;
  onExpandedChange?: (expanded: boolean) => void;
  onActiveChange?: (id: string) => void;
  className?: string;
  children: ReactNode;
}

function Root({
  expanded,
  activeId,
  expandedWidth = 220,
  collapsedWidth = 56,
  onExpandedChange,
  onActiveChange,
  className,
  children,
}: RootProps) {
  const width = expanded ? expandedWidth : collapsedWidth;

  return (
    <ActivityBarContext.Provider
      value={{ expanded, activeId, onActiveChange, onExpandedChange }}
    >
      <div
        className={cn(
          "relative flex flex-col h-full bg-background border-r",
          "transition-[width] duration-200 ease-in-out overflow-hidden",
          className,
        )}
        style={{ width }}
      >
        {children}
      </div>
    </ActivityBarContext.Provider>
  );
}

/* ─── Header ─── */

interface HeaderProps {
  title: string;
  className?: string;
}

function Header({ title, className }: HeaderProps) {
  const { expanded, onExpandedChange } = useActivityBar();

  return (
    <div
      role="button"
      tabIndex={0}
      title={expanded ? "收起侧边栏" : "展开侧边栏"}
      onClick={() => onExpandedChange?.(!expanded)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onExpandedChange?.(!expanded);
        }
      }}
      className={cn(
        "flex items-center rounded-md mx-2 px-3 py-2 cursor-pointer h-[52px] flex-shrink-0",
        "transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        className,
      )}
    >
      <div className="flex-shrink-0 [&>*]:w-5 [&>*]:h-5">
        {expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
      </div>
      <span
        className={cn(
          "ml-3 text-base font-semibold whitespace-nowrap overflow-hidden transition-all duration-200",
          expanded ? "opacity-100 max-w-[170px]" : "opacity-0 max-w-0 ml-0",
        )}
      >
        {title}
      </span>
    </div>
  );
}

/* ─── Item ─── */

interface ItemProps {
  id: string;
  icon: ReactNode;
  label: string;
  title?: string;
  className?: string;
}

function Item({ id, icon, label, title, className }: ItemProps) {
  const { expanded, activeId, onActiveChange } = useActivityBar();
  const isActive = activeId === id;

  return (
    <div
      role="button"
      tabIndex={0}
      title={title ?? label}
      onClick={() => onActiveChange?.(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActiveChange?.(id);
        }
      }}
      className={cn(
        "flex items-center rounded-md mx-2 px-3 py-2 cursor-pointer",
        "transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        className,
      )}
    >
      <div className="flex-shrink-0 [&>*]:w-5 [&>*]:h-5">{icon}</div>
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

/* ─── GroupList / Group / Footer / Separator ─── */

function GroupList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto overflow-x-hidden py-1", className)}
    >
      {children}
    </div>
  );
}

function Group({
  children,
  className,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 py-1", className)}>{children}</div>
  );
}

function Footer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex-shrink-0", className)}>{children}</div>;
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("mx-3 my-1 h-px bg-border", className)} />;
}

/* ─── Export ─── */

export const ActivityBar = {
  Root,
  Header,
  Item,
  GroupList,
  Group,
  Footer,
  Separator,
};
