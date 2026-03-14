import { getPresenter } from "@/core/presenter/presenter";
import { useIconStore } from "@/core/stores/icon.store";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { defineExtension, Disposable } from "@cardos/extension";
import { Sparkles } from "lucide-react";
import { i18n } from "@/core/hooks/use-i18n";

export const allInOneAgentExtension = defineExtension({
  manifest: {
    id: "all-in-one-agent",
    name: "All-in-One Agent",
    description: "全局超级智能体，系统级控制台",
    version: "1.0.0",
    author: "AgentsChattingRoom",
    icon: "sparkles",
  },
  activate: ({ subscriptions }) => {
    subscriptions.push(
      Disposable.from(
        useIconStore.getState().addIcons({
          sparkles: Sparkles,
        }),
      ),
    );
    subscriptions.push(
      Disposable.from(
        getPresenter().activityBar.addItem({
          id: "all-in-one-agent",
          label: i18n.t("activityBar.allInOneAgent.label"),
          title: i18n.t("activityBar.allInOneAgent.title"),
          group: "main",
          icon: "sparkles",
          order: 5,
        }),
      ),
    );
    subscriptions.push(
      Disposable.from(
        connectRouterWithActivityBar([
          {
            activityKey: "all-in-one-agent",
            routerPath: "/all-in-one-agent",
          },
        ]),
      ),
    );
  },
});
