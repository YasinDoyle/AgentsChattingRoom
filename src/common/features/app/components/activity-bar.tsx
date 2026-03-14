"use client";
import { useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IconRegistry } from "@/common/components/common/icon-registry";
import { ThemeToggle } from "@/common/components/common/theme";
import { LanguageToggle } from "@/common/components/common/language";
import { cn } from "@/common/lib/utils";
import { usePresenter } from "@/core/presenter";
import {
  useActivityBarStore,
  type ActivityItem,
} from "@/core/stores/activity-bar.store";
import { useAuth } from "@/core/hooks/use-auth";
import { ActivityBar } from "@/common/components/common/activity-bar";
import { CircleUserRound, Github } from "lucide-react";
interface ActivityBarProps {
  className?: string;
}

const AUTH_ITEM_ID = "auth-entry";
const GITHUB_ITEM_ID = "github-entry";

export function ActivityBarComponent({ className }: ActivityBarProps) {
  // subscribe state directly from zustand store (MVP: view subscribes state)
  const expanded = useActivityBarStore((s) => s.expanded);
  const activeId = useActivityBarStore((s) => s.activeId);
  const rawItems = useActivityBarStore((s) => s.items);
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectRef = useRef("");

  // actions are exposed via manager on presenter (MVP: actions via manager)
  const presenter = usePresenter();
  const activityBar = presenter.activityBar;

  // sort items by order without mutating store state
  const items = [...rawItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  // 按组筛选
  const mainGroupItems = items.filter((item) => item.group === "main");
  const footerItems = items.filter((item) => item.group === "footer");
  const hasFooterItems = footerItems.length > 0;

  const handleExpandedChange = (newExpanded: boolean) => {
    presenter.activityBar.setExpanded(newExpanded);
  };

  const handleActiveChange = (nextActiveId: string) => {
    const clicked = items.find((it) => it.id === nextActiveId);

    // per-item click handler if provided by extension/feature
    if (clicked?.onClick) {
      try {
        clicked.onClick();
      } catch {
        /* no-op */
      }
    }

    if (clicked?.id === AUTH_ITEM_ID || clicked?.id === GITHUB_ITEM_ID) {
      return;
    }

    // update active state after handling side effects
    presenter.activityBar.setActiveId(nextActiveId);
  };

  useEffect(() => {
    presenter.icon.addIcons({
      [AUTH_ITEM_ID]: CircleUserRound,
      [GITHUB_ITEM_ID]: Github,
    });
  }, [presenter]);

  useEffect(() => {
    const search = searchParams.toString();
    redirectRef.current = search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  const handleAuthClick = useCallback(() => {
    const redirect = redirectRef.current || "/chat";
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
  }, [router]);

  const handleGithubClick = useCallback(() => {
    window.open(
      "https://github.com/YasinDoyle",
      "_blank",
      "noopener,noreferrer",
    );
  }, []);

  useEffect(() => {
    const shouldShowAuthEntry = status !== "authenticated";
    const existing = activityBar
      .getItems()
      .some((item) => item.id === AUTH_ITEM_ID);
    if (!shouldShowAuthEntry) {
      if (existing) {
        activityBar.removeItem(AUTH_ITEM_ID);
      }
      return;
    }

    if (!existing) {
      activityBar.addItem({
        id: AUTH_ITEM_ID,
        icon: AUTH_ITEM_ID,
        label: "登录 / 注册",
        title: "登录或注册",
        group: "footer",
        order: 999,
        onClick: handleAuthClick,
      });
    }
  }, [activityBar, handleAuthClick, status]);

  useEffect(() => {
    const existing = activityBar
      .getItems()
      .some((item) => item.id === GITHUB_ITEM_ID);
    if (existing) return;

    activityBar.addItem({
      id: GITHUB_ITEM_ID,
      icon: GITHUB_ITEM_ID,
      label: "GitHub",
      title: "查看项目仓库",
      group: "footer",
      order: 950,
      onClick: handleGithubClick,
    });
  }, [activityBar, handleGithubClick]);

  return (
    <ActivityBar.Root
      expanded={expanded}
      activeId={activeId}
      expandedWidth={240}
      onExpandedChange={handleExpandedChange}
      onActiveChange={handleActiveChange}
      className={cn("flex-shrink-0", className)}
    >
      <ActivityBar.Header title="AgentsChattingRoom" />

      <ActivityBar.GroupList>
        <ActivityBar.Group title="main">
          {mainGroupItems.map((item: ActivityItem) => (
            <ActivityBar.Item
              key={item.id}
              id={item.id}
              icon={<IconRegistry id={item.icon} />}
              label={item.label}
              title={item.title}
            />
          ))}
        </ActivityBar.Group>
      </ActivityBar.GroupList>

      <ActivityBar.Footer>
        {hasFooterItems && <ActivityBar.Separator />}
        {hasFooterItems && (
          <ActivityBar.Group>
            {footerItems.map((item: ActivityItem) => (
              <ActivityBar.Item
                key={item.id}
                id={item.id}
                icon={<IconRegistry id={item.icon} />}
                label={item.label}
                title={item.title}
              />
            ))}
          </ActivityBar.Group>
        )}
        {hasFooterItems && <ActivityBar.Separator />}
        <div className="py-1">
          <LanguageToggle expanded={expanded} />
          <ThemeToggle expanded={expanded} />
        </div>
      </ActivityBar.Footer>
    </ActivityBar.Root>
  );
}
