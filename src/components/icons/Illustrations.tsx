type ArtProps = {
  className?: string;
};

const base = "us-illustration";

const stroke = {
  stroke: "var(--color-ink)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function BookArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={[base, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="34" y="24" width="88" height="82" rx="6" fill="var(--color-green)" />
      <rect
        x="44"
        y="16"
        width="88"
        height="84"
        rx="5"
        fill="var(--color-white)"
        {...stroke}
      />
      <path
        d="M44 21a5 5 0 0 1 5-5h78a5 5 0 0 1 5 5v9H44z"
        fill="var(--color-green)"
      />
      <rect x="56" y="40" width="54" height="7" rx="3.5" fill="var(--color-mint)" />
      <rect x="56" y="55" width="42" height="5" rx="2.5" fill="var(--color-mint)" />
      <rect x="56" y="66" width="50" height="5" rx="2.5" fill="var(--color-mint)" />
      <rect x="56" y="77" width="34" height="5" rx="2.5" fill="var(--color-mint)" />
      <path
        d="M108 16v28l-7-6-7 6V16z"
        fill="var(--color-yellow)"
        {...stroke}
      />
      <path d="M56 90h26" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ArduinoArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={[base, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="18"
        y="31"
        width="124"
        height="64"
        rx="8"
        fill="var(--color-green)"
        {...stroke}
      />
      <rect x="33" y="37" width="48" height="8" rx="2" fill="var(--color-ink)" />
      <g stroke="var(--color-mint)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M38 37v8M44 37v8M50 37v8M56 37v8M62 37v8M68 37v8M74 37v8" />
      </g>
      <rect
        x="102"
        y="38"
        width="26"
        height="18"
        rx="2"
        fill="var(--color-white)"
        {...stroke}
      />
      <rect
        x="66"
        y="46"
        width="28"
        height="28"
        rx="2"
        fill="var(--color-ink)"
      />
      <g fill="var(--color-mint)">
        <rect x="70" y="41" width="2.5" height="5" rx="1" />
        <rect x="76" y="41" width="2.5" height="5" rx="1" />
        <rect x="82" y="41" width="2.5" height="5" rx="1" />
        <rect x="88" y="41" width="2.5" height="5" rx="1" />
      </g>
      <rect
        x="34"
        y="57"
        width="24"
        height="18"
        rx="2"
        fill="var(--color-mint)"
        {...stroke}
      />
      <circle cx="42" cy="83" r="5" fill="var(--color-mint)" />
      <circle cx="54" cy="83" r="3" fill="var(--color-white)" />
      <g stroke="var(--color-mint)" strokeWidth="2" strokeLinecap="round">
        <path d="M60 62h6v22" />
        <path d="M96 76h14v10" />
        <path d="M34 94v-2" />
      </g>
      <circle cx="124" cy="82" r="4" fill="var(--color-yellow)" />
      <circle cx="30" cy="42" r="3" fill="none" {...stroke} strokeWidth="1.5" />
      <circle cx="130" cy="42" r="3" fill="none" {...stroke} strokeWidth="1.5" />
    </svg>
  );
}

export function HandoutArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={[base, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      focusable="false"
    >
      <g transform="rotate(7 80 60)">
        <rect
          x="50"
          y="26"
          width="62"
          height="80"
          rx="4"
          fill="var(--color-mint)"
          {...stroke}
        />
      </g>
      <g transform="rotate(-4 80 60)">
        <rect
          x="46"
          y="18"
          width="64"
          height="82"
          rx="4"
          fill="var(--color-white)"
          {...stroke}
        />
        <path d="M46 22a4 4 0 0 1 4-4h56a4 4 0 0 1 4 4v8H46z" fill="var(--color-green)" />
        <g>
          <rect x="56" y="38" width="30" height="4" rx="2" fill="var(--color-green)" />
          <rect x="56" y="48" width="44" height="3.5" rx="1.75" fill="var(--color-mint)" />
          <rect x="56" y="56" width="38" height="3.5" rx="1.75" fill="var(--color-mint)" />
          <rect x="56" y="64" width="44" height="3.5" rx="1.75" fill="var(--color-mint)" />
          <rect x="56" y="80" width="26" height="3.5" rx="1.75" fill="var(--color-mint)" />
        </g>
        <path
          d="M98 83l-16 8 4-17z"
          fill="var(--color-yellow)"
          {...stroke}
        />
      </g>
      <g transform="rotate(4 108 80)">
        <rect
          x="90"
          y="74"
          width="34"
          height="30"
          rx="3"
          fill="var(--color-yellow)"
        />
        <path d="M98 84h18M98 92h12" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function LabCoatArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={[base, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M62 16l-14 8-16 16 10 18 10-6v44a4 4 0 0 0 4 4h48a4 4 0 0 0 4-4V52l10 6 10-18-16-16-14-8c-2 10-34 10-36 0z"
        fill="var(--color-white)"
        {...stroke}
      />
      <path d="M62 16c2 10 34 10 36 0" fill="none" {...stroke} />
      <path d="M80 27v16" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="54" r="2.5" fill="var(--color-green)" />
      <circle cx="80" cy="66" r="2.5" fill="var(--color-green)" />
      <circle cx="80" cy="78" r="2.5" fill="var(--color-green)" />
      <rect
        x="88"
        y="46"
        width="14"
        height="8"
        rx="2"
        fill="var(--color-yellow)"
      />
      <rect
        x="62"
        y="72"
        width="16"
        height="13"
        rx="2"
        fill="var(--color-mint)"
        {...stroke}
      />
      <path d="M46 52l-5 8M113 52l4 8M56 88h4" stroke="var(--color-mint)" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 21l8 9M104 21l-8 9" stroke="var(--color-mint)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function OpenBagArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={[base, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="42"
        y="28"
        width="76"
        height="76"
        rx="12"
        fill="var(--color-mint)"
        {...stroke}
      />
      <path
        d="M58 32c0-11 7-18 16-18h12c9 0 16 7 16 18"
        fill="none"
        {...stroke}
      />
      <g>
        <rect
          x="56"
          y="16"
          width="18"
          height="28"
          rx="2"
          fill="var(--color-white)"
          {...stroke}
        />
        <rect
          x="76"
          y="7"
          width="20"
          height="37"
          rx="2"
          fill="var(--color-yellow)"
          {...stroke}
        />
        <rect
          x="98"
          y="18"
          width="16"
          height="26"
          rx="2"
          fill="var(--color-green)"
          {...stroke}
        />
        <path d="M82 13h8M82 19h8" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path
        d="M42 52h76v36a16 16 0 0 1-16 16H58a16 16 0 0 1-16-16z"
        fill="var(--color-green)"
        {...stroke}
      />
      <rect
        x="64"
        y="72"
        width="32"
        height="17"
        rx="4"
        fill="var(--color-mint)"
        {...stroke}
      />
      <circle cx="80" cy="80" r="2" fill="var(--color-green)" />
    </svg>
  );
}

export const illustrationByCategory = {
  livres: BookArt,
  cours: HandoutArt,
  electronique: ArduinoArt,
  labo: LabCoatArt,
} as const;

export type IllustrationName = keyof typeof illustrationByCategory | "sac";

export function Illustration({
  name,
  className,
}: {
  name: IllustrationName;
  className?: string;
}) {
  if (name === "sac") return <OpenBagArt className={className} />;
  const Art = illustrationByCategory[name];
  return <Art className={className} />;
}
