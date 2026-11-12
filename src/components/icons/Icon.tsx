import type { ReactNode } from "react";

export type IconName =
  | "home"
  | "search"
  | "plus"
  | "message"
  | "user"
  | "bell"
  | "book"
  | "doc"
  | "chip"
  | "flask"
  | "arrow-left"
  | "send"
  | "bookmark"
  | "check"
  | "close"
  | "camera"
  | "pin"
  | "share"
  | "flag"
  | "edit"
  | "trash"
  | "alert"
  | "chevron-down"
  | "chevron-right"
  | "mail"
  | "eye"
  | "eye-off"
  | "logout"
  | "info"
  | "clock"
  | "shield"
  | "offline"
  | "copy"
  | "hand"
  | "sparkle";

const PATHS: Record<IconName, ReactNode> = {
  home: (
    <path d="M4 10.5 12 4l8 6.5V19a2 2 0 0 1-2 2h-3.5v-6h-5v6H6a2 2 0 0 1-2-2z" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  message: (
    <path d="M20 15a2 2 0 0 1-2 2H9l-5 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  book: (
    <>
      <path d="M12 6c-2-2-5-2-8-1v13c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1z" />
      <path d="M12 6v13" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
      <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
      <path d="M8 15h8" />
    </>
  ),
  "arrow-left": <path d="M20 12H4M10 6l-6 6 6 6" />,
  send: (
    <>
      <path d="M21 3 10 14" />
      <path d="M21 3l-6.5 18-4.5-7-7-4.5z" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4.5L6 21z" />,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v12H4z" />
      <circle cx="12" cy="14" r="3.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V3M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 5h11l-2 3 2 3H5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m14 5 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3" />
      <path d="m6 7 1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 22 20H2z" />
      <path d="M12 9v5" />
      <path d="M12 17.2v.1" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A10.9 10.9 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.3 4" />
      <path d="M6.5 7.7A16.7 16.7 0 0 0 2 12s4 6 10 6a10 10 0 0 0 4.1-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H5v16h5" />
      <path d="m15 8 4 4-4 4M19 12H9" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8v.1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  offline: (
    <>
      <path d="M4 4l16 16" />
      <path d="M8.5 16.5A4.5 4.5 0 0 1 9 7.6" />
      <path d="M12 5.5a7 7 0 0 1 6.5 9.4M4.5 14.5a4.4 4.4 0 0 1 2-7.3" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </>
  ),
  hand: (
    <>
      <path d="M8 13V7.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M11 12V6.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M14 12V8.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a6 6 0 0 1-5.2-3l-1.3-2.3a1.7 1.7 0 0 1 2.9-1.7L8 16" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
    </>
  ),
};

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
};

/** Icônes maison, grille 24, trait 2 px, bouts arrondis, currentColor. */
export function Icon({ name, size = 24, className, filled = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

export const categoryIcons = {
  livres: "book",
  cours: "doc",
  electronique: "chip",
  labo: "flask",
} as const satisfies Record<string, IconName>;
