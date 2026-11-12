import type { CSSProperties } from "react";
import { Link } from "react-router";

function Symbol({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="48" height="48" rx="12" fill="var(--color-green)" />
      <g
        fill="none"
        stroke="var(--color-white)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.5 26.5a10.5 10.5 0 0 1 21 0" />
        <path d="M31.7 23.7l2.8 2.8 2.8-2.8" />
        <path d="M34.5 21.5a10.5 10.5 0 0 1-21 0" />
        <path d="M10.7 24.3l2.8-2.8 2.8 2.8" />
      </g>
      <circle cx="24" cy="24" r="3.4" fill="var(--color-yellow)" />
    </svg>
  );
}

export function Logo({
  variant = "full",
  size = 32,
  href,
  className,
  style,
}: {
  variant?: "full" | "symbol";
  size?: number;
  href?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const content =
    variant === "symbol" ? (
      <Symbol size={size} />
    ) : (
      <>
        <Symbol size={size} />
        <span className="us-logo__text">Univ-Share</span>
      </>
    );

  if (href) {
    return (
      <Link
        to={href}
        className={["us-logo", className].filter(Boolean).join(" ")}
        style={style}
        aria-label="Univ-Share, retour à l'accueil"
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      className={["us-logo", className].filter(Boolean).join(" ")}
      style={style}
    >
      {content}
    </span>
  );
}

export function LogoLockup() {
  return (
    <div className="us-logo-lockup">
      <Symbol size={44} />
      <span className="us-logo-lockup__text">Univ-Share</span>
    </div>
  );
}
