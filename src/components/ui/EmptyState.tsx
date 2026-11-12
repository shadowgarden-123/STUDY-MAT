import type { ReactNode } from "react";
import { Illustration, type IllustrationName } from "@/components/icons/Illustrations";

export function EmptyState({
  art = "sac",
  title,
  text,
  action,
  className,
}: {
  art?: IllustrationName;
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={["us-empty", className].filter(Boolean).join(" ")}>
      <Illustration name={art} className="us-empty__art" />
      <p className="us-empty__title">{title}</p>
      {text ? <p className="us-empty__text">{text}</p> : null}
      {action}
    </div>
  );
}
