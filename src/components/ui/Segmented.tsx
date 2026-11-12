import { Icon, type IconName } from "@/components/icons/Icon";

type Option<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: Array<Option<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={["us-segmented", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="us-segmented__option"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.icon ? <Icon name={option.icon} size={18} /> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}
