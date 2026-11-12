import { NavLink } from "react-router";
import { useQuery } from "convex/react";
import { Icon, type IconName } from "@/components/icons/Icon";
import { api } from "@/convex/_generated/api";
import { fr } from "@/i18n/fr";

type Tab = {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  unread?: boolean;
  primary?: boolean;
};

export function TabBar() {
  const unread = useQuery(api.conversations.unreadCount) ?? 0;
  const tabs: Tab[] = [
    { to: "/annonces", label: fr.nav.home, icon: "home" },
    { to: "/publier", label: fr.nav.publish, icon: "plus", primary: true },
    { to: "/messages", label: fr.nav.messages, icon: "message", unread: true },
    { to: "/profil", label: fr.nav.profile, icon: "user" },
  ];

  return (
    <nav className="us-tabbar" aria-label="Navigation principale">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={[
            "us-tabbar__item",
            tab.primary ? "us-tabbar__item--publish" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="us-tabbar__icon">
            <Icon name={tab.icon} size={24} />
            {tab.unread && unread > 0 ? (
              <span className="us-tabbar__badge" aria-hidden="true">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </span>
          <span>{tab.label}</span>
          {tab.unread && unread > 0 ? (
            <span className="us-sr-only">{fr.messages.unreadCount(unread)}</span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
