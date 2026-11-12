import { Icon, categoryIcons } from "@/components/icons/Icon";
import type { Category, Mode } from "@/convex/config/campus";
import { formatPrice } from "@/lib/format";
import { fr } from "@/i18n/fr";

export function ModePill({ mode, price }: { mode: Mode; price?: number | null }) {
  return (
    <span className={`us-pill us-pill--${mode}`}>
      {fr.modes[mode]}
      {mode === "prix" && typeof price === "number" ? (
        <span aria-hidden="true"> · {formatPrice(price)}</span>
      ) : null}
    </span>
  );
}

export function CategoryPill({ category }: { category: Category }) {
  return (
    <span className="us-pill us-pill--categorie">
      <Icon name={categoryIcons[category]} size={14} />
      {fr.categories[category]}
    </span>
  );
}

export function StatusPill({ status }: { status: "disponible" | "donne" }) {
  return (
    <span className="us-pill us-pill--status">
      {status === "donne" ? fr.common.given : fr.common.available}
    </span>
  );
}
