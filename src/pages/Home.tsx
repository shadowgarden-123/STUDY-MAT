import { useEffect, useRef, useState } from "react";
import { Link, useNavigationType, useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CATEGORIES, MODES, type Category, type Mode } from "@/convex/config/campus";
import { useSession } from "@/auth/AuthContext";
import { useAnalytics } from "@/lib/analytics";
import { useDebounce } from "@/lib/useDebounce";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { activeCampaign } from "@/lib/campaigns";
import { firstName } from "@/lib/format";
import { fr } from "@/i18n/fr";
import { Icon } from "@/components/icons/Icon";
import { Logo } from "@/components/icons/Logo";
import { Button, ButtonLink } from "@/components/ui/UsButton";
import { Dialog } from "@/components/ui/UsDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingCard, ListingGridSkeleton } from "@/components/listings/ListingCard";
import { CategoryChips, FilterAside, ModeChips } from "@/components/listings/FilterBar";
import { FeedTabs, type ModeCounts } from "@/components/listings/FeedTabs";
import { HomeBellButton } from "@/components/layout/TopNav";
import type { ListingSummary } from "@/types/listing";

const PAGE_SIZE = 12;
const CAMPAIGN_KEY = "univ-share:campaign-dismissed";
const SCROLL_KEY = "univ-share:home-scroll";

function isCategory(value: string | null): value is Category {
  return CATEGORIES.includes(value as Category);
}

function isMode(value: string | null): value is Mode {
  return MODES.includes(value as Mode);
}

function readDismissedCampaign(): string | null {
  try {
    return window.localStorage.getItem(CAMPAIGN_KEY);
  } catch {
    return null;
  }
}

function useRestoreScroll() {
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === "POP") {
      const saved = Number(window.sessionStorage.getItem(SCROLL_KEY) ?? "0");
      if (saved > 0) window.scrollTo({ top: saved, behavior: "auto" });
    }
    const save = () => {
      window.sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      save();
      window.removeEventListener("scroll", save);
    };
  }, [navigationType]);
}

export default function Home() {
  const { isAuthenticated, profile } = useSession();
  const track = useAnalytics();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const catParam = params.get("cat");
  const modeParam = params.get("mode");
  const category = isCategory(catParam) ? catParam : null;
  const mode = isMode(modeParam) ? modeParam : null;

  const [search, setSearch] = useState(q);
  const debounced = useDebounce(search, 300);
  const filterKey = `${q}::${category ?? ""}::${mode ?? ""}`;
  const [pageState, setPageState] = useState({ key: filterKey, count: PAGE_SIZE });
  const visible = pageState.key === filterKey ? pageState.count : PAGE_SIZE;
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(() =>
    readDismissedCampaign(),
  );
  const campaign = activeCampaign();
  const searchRef = useRef<HTMLInputElement>(null);

  useDocumentMeta({
    title: "Univ-Share — donner, échanger, partager le matériel du campus",
    description:
      "Livres, cours, composants électroniques et matériel de labo entre étudiants. Trouve ou donne un objet utile en moins d'une minute.",
    path: "/annonces",
  });

  useRestoreScroll();

  useEffect(() => {
    track("visit_home", { campaign: campaign?.id });
  }, [track, campaign?.id]);

  useEffect(() => {
    if (debounced === q) return;
    const next = new URLSearchParams(params);
    if (debounced.trim()) next.set("q", debounced.trim());
    else next.delete("q");
    setParams(next, { replace: true });
    if (debounced.trim()) track("search", { value: debounced.trim() });
  }, [debounced, params, q, setParams, track]);

  const results = useQuery(api.listings.list, {
    q: q || undefined,
    category: category ?? undefined,
    mode: mode ?? undefined,
    limit: 96,
    offset: 0,
  });
  const counts = useQuery(api.listings.modeCounts) as ModeCounts | undefined;

  const updateParam = (key: "cat" | "mode", value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    track("filter_used", { value: `${key}:${value ?? "tout"}` });
  };

  const clearFilters = () => {
    setParams(new URLSearchParams());
    setSearch("");
  };

  const showMore = () => {
    setPageState({ key: filterKey, count: visible + PAGE_SIZE });
  };

  const items = (results?.items ?? []) as ListingSummary[];
  const total = results?.total ?? 0;
  const shown = items.slice(0, visible);
  const hasFilters = Boolean(q || category || mode);
  const showCampaign =
    !isAuthenticated && campaign !== null && dismissed !== campaign.id;

  return (
    <>
      <div className="us-container">
        <div className="us-mobile-head">
          <Logo href="/annonces" />
          <HomeBellButton onClick={() => setAlertsOpen(true)} />
        </div>
      </div>

      {showCampaign && campaign ? (
        <div className="us-container">
          <div className="campaign" role="region" aria-label="Annonce du campus">
            <span className="campaign__tag">{campaign.tag}</span>
            <span>{campaign.message}</span>
            <Link to={campaign.href} className="campaign__link">
              {fr.campaign.link}
            </Link>
            <button
              type="button"
              className="campaign__close"
              aria-label={fr.home.unsubscribe}
              onClick={() => {
                setDismissed(campaign.id);
                try {
                  window.localStorage.setItem(CAMPAIGN_KEY, campaign.id);
                } catch {
                  /* stockage local indisponible : le bandeau revient, sans casser la page */
                }
              }}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <section className="hero hero--compact">
        <div className="us-container hero__inner">
          <div className="hero__copy">
            {isAuthenticated && profile?.displayName ? (
              <p className="hero__greeting">
                {fr.home.greeting(firstName(profile.displayName))}
              </p>
            ) : (
              <p className="us-eyebrow hero__eyebrow">{fr.home.eyebrow}</p>
            )}
            <h1 className="hero__title">
              {isAuthenticated ? fr.home.compactTitle : fr.home.title}
            </h1>

            <form
              className="us-search hero__search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                const next = new URLSearchParams(params);
                if (search.trim()) next.set("q", search.trim());
                else next.delete("q");
                setParams(next);
                if (search.trim()) track("search", { value: search.trim() });
              }}
            >
              <Icon name="search" size={22} />
              <label className="us-sr-only" htmlFor="home-search">
                {fr.home.searchLabel}
              </label>
              <input
                id="home-search"
                ref={searchRef}
                className="us-input"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={fr.home.searchPlaceholder}
                autoComplete="off"
                enterKeyHint="search"
              />
              {search ? (
                <button
                  type="button"
                  className="us-search__clear"
                  aria-label="Effacer la recherche"
                  onClick={() => {
                    setSearch("");
                    searchRef.current?.focus();
                  }}
                >
                  <Icon name="close" size={18} />
                </button>
              ) : null}
            </form>

            {!isAuthenticated ? (
              <p className="us-caption home__guest-note">
                {fr.journey.nudge.title}{" "}
                <Link className="us-link" to="/inscription">
                  {fr.journey.nudge.action}
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="feed" aria-labelledby="fil-recent">
        <div className="us-container feed__layout">
          <aside className="feed__aside" aria-label={fr.home.filtersTitle}>
            <FilterAside
              category={category}
              mode={mode}
              onChangeCategory={(value) => updateParam("cat", value ?? null)}
              onChangeMode={(value) => updateParam("mode", value ?? null)}
            />
          </aside>

          <div className="feed__main">
            <div className="feed__header">
              <h2 className="feed__title" id="fil-recent">
                {fr.home.recent}
              </h2>
              {results ? (
                <span className="feed__count">{fr.home.resultCount(total)}</span>
              ) : null}
            </div>

            <FeedTabs
              value={mode}
              counts={counts}
              onChange={(value) => updateParam("mode", value)}
            />

            <div className="feed__filters">
              <CategoryChips
                value={category}
                onChange={(value) => updateParam("cat", value ?? null)}
              />
              <div className="feed__mode-row">
                <ModeChips
                  value={mode}
                  onChange={(value) => updateParam("mode", value ?? null)}
                />
              </div>
            </div>

            {results === undefined ? (
              <ListingGridSkeleton count={6} />
            ) : total === 0 ? (
              <EmptyState
                title={
                  hasFilters ? fr.home.emptyTitle : "Le fil est encore vide."
                }
                text={fr.home.emptyText}
                action={
                  <div className="us-cluster" style={{ justifyContent: "center" }}>
                    <ButtonLink to="/publier" icon="plus">
                      {fr.actions.publish}
                    </ButtonLink>
                    {hasFilters ? (
                      <Button variant="secondary" onClick={clearFilters}>
                        {fr.actions.newSearch}
                      </Button>
                    ) : null}
                  </div>
                }
              />
            ) : (
              <>
                <div className="feed__grid">
                  {shown.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
                {items.length > visible ? (
                  <div className="feed__more">
                    <Button variant="secondary" onClick={showMore}>
                      {fr.home.more}
                      <Icon name="chevron-down" size={18} />
                    </Button>
                    <p className="us-caption">
                      {shown.length} {fr.common.of} {items.length}
                    </p>
                  </div>
                ) : (
                  <div className="feed__more">
                    <p className="us-caption">
                      {total > items.length
                        ? fr.home.capNote
                        : "Tu as vu toutes les annonces de ce filtre."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

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
          <Button onClick={() => setAlertsOpen(false)}>{fr.alerts.close}</Button>
        </div>
      </Dialog>
    </>
  );
}
