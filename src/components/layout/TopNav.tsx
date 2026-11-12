import { useState } from "react";
import { NavLink, Link } from "react-router";
import { useQuery } from "convex/react";
import { Logo } from "@/components/icons/Logo";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/UsButton";
import { Avatar } from "@/components/ui/UsAvatar";
import { Dialog } from "@/components/ui/UsDialog";
import { useSession } from "@/auth/AuthContext";
import { api } from "@/convex/_generated/api";
import { fr } from "@/i18n/fr";

export function TopNav() {
  const { isAuthenticated, profile } = useSession();
  const unread = useQuery(api.conversations.unreadCount) ?? 0;
  const name = profile?.displayName ?? fr.common.student;
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <header className="us-topnav">
      <div className="us-container us-topnav__inner">
        <Logo href="/" />
        <nav className="us-topnav__links" aria-label="Navigation principale">
          <NavLink to="/" end className="us-topnav__link">
            {fr.nav.home}
          </NavLink>
          <NavLink
            to="/comment-ca-marche"
            className="us-topnav__link us-topnav__link--how"
          >
            {fr.nav.howItWorks}
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/messages" className="us-topnav__link">
              {fr.nav.messages}
              {unread > 0 ? (
                <span className="us-tabbar__badge" aria-hidden="true">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
              {unread > 0 ? (
                <span className="us-sr-only">
                  {fr.messages.unreadCount(unread)}
                </span>
              ) : null}
            </NavLink>
          ) : null}
        </nav>

        <div className="us-topnav__actions">
          <button
            type="button"
            className="us-topnav__icon-link"
            aria-label={fr.nav.alerts}
            onClick={() => setAlertsOpen(true)}
          >
            <Icon name="bell" />
          </button>
          {isAuthenticated ? (
            <>
              <ButtonLink to="/publier" icon="plus">
                {fr.actions.publish}
              </ButtonLink>
              <Link
                to="/profil"
                className="us-topnav__icon-link"
                aria-label={`${fr.nav.profile} — ${name}`}
              >
                <Avatar name={name} size="s" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/connexion" className="us-topnav__link">
                {fr.actions.login}
              </Link>
              <ButtonLink to="/publier" icon="plus">
                {fr.actions.publish}
              </ButtonLink>
            </>
          )}
        </div>
      </div>
      <Dialog
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        title={fr.alerts.title}
        variant="sheet"
      >
        <p>{fr.alerts.body}</p>
        <p className="us-caption" style={{ marginTop: 8 }}>
          {fr.alerts.note}
        </p>
        <div className="us-dialog__actions">
          <button
            type="button"
            className="us-btn"
            onClick={() => setAlertsOpen(false)}
          >
            {fr.alerts.close}
          </button>
        </div>
      </Dialog>
    </header>
  );
}

export function HomeBellButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="us-btn us-btn--ghost us-btn--icon"
      aria-label={fr.nav.alerts}
      onClick={onClick}
    >
      <Icon name="bell" />
    </button>
  );
}
