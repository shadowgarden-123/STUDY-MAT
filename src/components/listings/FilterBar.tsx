import { Icon, categoryIcons } from "@/components/icons/Icon";
import { CATEGORIES, MODES, type Category, type Mode } from "@/convex/config/campus";
import { fr } from "@/i18n/fr";

export function CategoryChips({
  value,
  onChange,
}: {
  value: Category | null;
  onChange: (value: Category | null) => void;
}) {
  return (
    <div
      className="us-filter-row"
      role="group"
      aria-label={fr.home.categoryFilter}
    >
      <button
        type="button"
        className="us-chip"
        aria-pressed={value === null}
        onClick={() => onChange(null)}
      >
        {fr.common.all}
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className="us-chip"
          aria-pressed={value === category}
          onClick={() => onChange(category)}
        >
          <Icon name={categoryIcons[category]} size={16} />
          {fr.categoryShort[category]}
        </button>
      ))}
    </div>
  );
}

export function ModeChips({
  value,
  onChange,
}: {
  value: Mode | null;
  onChange: (value: Mode | null) => void;
}) {
  return (
    <div
      className="us-filter-row us-filter-row--modes"
      role="group"
      aria-label={fr.home.modeFilter}
    >
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className="us-chip us-chip--mode"
          aria-pressed={value === mode}
          onClick={() => onChange(value === mode ? null : mode)}
        >
          {fr.modes[mode]}
        </button>
      ))}
    </div>
  );
}

export function FilterAside({
  category,
  mode,
  onChangeCategory,
  onChangeMode,
}: {
  category: Category | null;
  mode: Mode | null;
  onChangeCategory: (value: Category | null) => void;
  onChangeMode: (value: Mode | null) => void;
}) {
  return (
    <div>
      <div className="side-filter__group">
        <p className="side-filter__group-title">{fr.home.categoryFilter}</p>
        <div className="side-filter">
          <button
            type="button"
            className="side-filter__button"
            aria-pressed={category === null}
            onClick={() => onChangeCategory(null)}
          >
            {fr.common.all}
            {category === null ? <Icon name="check" size={18} /> : null}
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className="side-filter__button"
              aria-pressed={category === item}
              onClick={() => onChangeCategory(item)}
            >
              <span className="us-cluster">
                <Icon name={categoryIcons[item]} size={18} />
                {fr.categories[item]}
              </span>
              {category === item ? <Icon name="check" size={18} /> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="side-filter__group">
        <p className="side-filter__group-title">{fr.home.modeFilter}</p>
        <div className="side-filter">
          <button
            type="button"
            className="side-filter__button"
            aria-pressed={mode === null}
            onClick={() => onChangeMode(null)}
          >
            {fr.common.all}
            {mode === null ? <Icon name="check" size={18} /> : null}
          </button>
          {MODES.map((item) => (
            <button
              key={item}
              type="button"
              className="side-filter__button"
              aria-pressed={mode === item}
              onClick={() => onChangeMode(mode === item ? null : item)}
            >
              {fr.modes[item]}
              {mode === item ? <Icon name="check" size={18} /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
