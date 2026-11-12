import { useEffect, useMemo, useRef, useState } from "react";
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
import { OpenBagArt } from "@/components/icons/Illustrations";
import { Button, ButtonLink } from "@/components/ui/UsButton";
import { Dialog } from "@/components/ui/UsDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingCard, ListingGridSkeleton } from "@/components/listings/ListingCard";
import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { CategoryChips, FilterAside, ModeChips } from "@/components/listings/FilterBar";
import { HomeBellButton } from "@/components/layout/TopNav";
import type { ListingSummary } from "@/types/listing";

const PAGE_SIZE = 12;
const TRUST_ICONS = ["shield", "hand", "info"] as const;
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
  const visible =
    pageState.key === filterKey ? pageState.count : PAGE_SIZE;
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(() =>
    readDismissedCampaign(),
  );
  const campaign = useMemo(() => activeCampaign(), []);
  const searchRef = useRef<HTMLInputElement>(null);

  useDocumentMeta({
    title: "Univ-Share — donner, échanger, partager le matériel du campus",
    description:
      "Livres, cours, composants électroniques et matériel de labo entre étudiants. Trouve ou donne un objet utile en moins d'une minute.",
    path: "/",
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
  const boardItems = items.slice(0, 2);
  const hasFilters = Boolean(q || category || mode);
  const showCampaign =
    !isAuthenticated && campaign !== null && dismissed !== campaign.id;

  return (
    <>
      <div className="us-container">
        <div className="us-mobile-head">
          <Logo href="/" />
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

      <section className={`hero${isAuthenticated ? " hero--compact" : ""}`}>
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
            {!isAuthenticated ? <p className="hero__lead">{fr.home.lead}</p> : null}

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
              <div className="hero__chips">
                <span className="hero__chips-label">{fr.home.quickLabel}</span>
                {CATEGORIES.map((item) => (
                  <Link
                    key={item}
                    className="hero__chip"
                    to={`/?cat=${item}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  >
                    {fr.categoryShort[item]}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {!isAuthenticated ? (
            <aside className="hero-board" aria-label={fr.home.boardLabel}>
              <div className="hero-board__head">
                <span className="hero-board__label">{fr.home.boardLabel}</span>
                <Icon name="sparkle" size={18} />
              </div>
              <OpenBagArt className="hero-board__art" />
              <div className="hero-board__cards">
                {boardItems.length > 0 ? (
                  boardItems.map((listing) => (
                    <Link
                      key={listing._id}
                      to={`/annonce/${listing._id}`}
                      className="hero-board__card"
                    >
                      <span className="hero-board__card-thumb">
                        <ListingPhoto
                          photoUrl={listing.photoUrl}
                          category={listing.category}
                          alt=""
                          variant="thumb"
                        />
                      </span>
                      <span>
                        <span className="hero-board__card-title">
                          {listing.title}
                        </span>
                        <span className="hero-board__card-meta">
                          {listing.location} · {fr.modes[listing.mode]}
                        </span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="us-caption">
                    Les premières annonces du campus arrivent ici.
                  </p>
                )}
              </div>
              <p className="hero-board__quote">
                {fr.home.boardQuote}
                <span>{fr.home.boardAuthor}</span>
              </p>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="feed" aria-labelledby="fil-recent">
        <div className="us-container feed__layout">
          <aside className="feed__aside" aria-label={fr.home.filtersTitle}>
            <FilterAside
              category={category}
              mode={mode}
              onChangeCategory={(value) =>
                updateParam("cat", value ?? null)
              }
              onChangeMode={(value) => updateParam("mode", value ?? null)}
            />
          </aside>

          <div className="feed__main">
            <div className="feed__header">
              <h2 className="feed__title" id="fil-recent">
                {fr.home.recent}
              </h2>
              {results ? (
                <span className="feed__count">
                  {fr.home.resultCount(total)}
                </span>
              ) : null}
            </div>

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

      {!isAuthenticated ? (
        <>
          <section className="steps-band" aria-labelledby="etapes">
            <div className="us-container">
              <div className="steps-band__head">
                <h2 id="etapes">{fr.home.stepsTitle}</h2>
                <p className="us-muted">{fr.home.stepsLead}</p>
              </div>
              <ol className="steps-band__grid">
                {fr.home.steps.map((step, index) => (
                  <li className="step" key={step.title}>
                    <span className="step__num" aria-hidden="true">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="step__title">{step.title}</p>
                      <p className="step__text">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <div className="us-container">
            <div className="cta-band">
              <div className="us-stack">
                <h2>{fr.home.ctaTitle}</h2>
                <p>{fr.home.ctaText}</p>
                <div className="cta-band__actions">
                  <ButtonLink to="/publier" variant="secondary" icon="plus">
                    {fr.actions.publish}
                  </ButtonLink>
                  <ButtonLink to="/comment-ca-marche" variant="ghost">
                    {fr.nav.howItWorks}
                  </ButtonLink>
                </div>
              </div>
              <OpenBagArt className="cta-band__art" />
            </div>

            <div className="trust-band">
              {fr.home.trust.map((item, index) => (
                <div className="trust-band__item" key={item.title}>
                  <span className="trust-band__icon">
                    <Icon
                      name={TRUST_ICONS[index] ?? "info"}
                      size={20}
                    />
                  </span>
                  <div>
                    <p className="trust-band__title">{item.title}</p>
                    <p className="trust-band__text">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

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
