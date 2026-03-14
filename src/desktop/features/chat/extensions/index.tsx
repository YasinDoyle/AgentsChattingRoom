import { getPresenter } from "@/core/presenter/presenter";
import { defineExtension, Disposable } from "@cardos/extension";
import { MessagesSquare } from "lucide-react";
import { connectRouterWithActivityBar } from "@/core/utils/connect-router-with-activity-bar";
import { ModuleOrderEnum } from "@/core/config/module-order";
import { i18n } from "@/core/hooks/use-i18n";

export const desktopChatExtension = defineExtension({
  manifest: {
    id: "chat",
    name: "Chat",
    description: "Chat with the user",
    version: "1.0.0",
    author: "AgentsChattingRoom",
    icon: "message",
  },
  activate: ({ subscriptions }) => {
    const presenter = getPresenter();
    subscriptions.push(
      Disposable.from(
        presenter.icon.addIcons({
          message: MessagesSquare,
        }),
      ),
    );
    subscriptions.push(
      Disposable.from(
        presenter.activityBar.addItem({
          id: "chat",
          label: i18n.t("activityBar.chat.label"),
          title: i18n.t("activityBar.chat.title"),
          group: "main",
          icon: "message",
          order: ModuleOrderEnum.CHAT,
        }),
      ),
    );

    subscriptions.push(
      Disposable.from(
        connectRouterWithActivityBar([
          {
            activityKey: "chat",
            routerPath: "/chat",
          },
        ]),
      ),
    );
  },
});
