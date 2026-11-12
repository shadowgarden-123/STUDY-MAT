import type { Mode } from "@/convex/config/campus";
import { fr } from "@/i18n/fr";

export type ModeCounts = {
  don: number;
  echange: number;
  prix: number;
  total: number;
};

export function FeedTabs({
  value,
  onChange,
  counts,
}: {
  value: Mode | null;
  onChange: (value: Mode | null) => void;
  counts?: ModeCounts;
}) {
  const tabs: Array<{ value: Mode | null; label: string; count?: number }> = [
    { value: null, label: fr.journey.tabs.all, count: counts?.total },
    { value: "don", label: fr.journey.tabs.don, count: counts?.don },
    { value: "echange", label: fr.journey.tabs.echange, count: counts?.echange },
    { value: "prix", label: fr.journey.tabs.prix, count: counts?.prix },
  ];

  return (
    <div className="feed-tabs" role="group" aria-label={fr.journey.tabs.label}>
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className="feed-tabs__tab"
          aria-pressed={value === tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span className="feed-tabs__count" aria-hidden="true">
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
