import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { Icon, type IconName } from "@/components/icons/Icon";

type Variant = "primary" | "secondary" | "ghost" | "quiet" | "danger";
type Size = "md" | "small";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: IconName;
  children?: ReactNode;
  className?: string;
};

function classes({ variant = "primary", size, block, className }: CommonProps) {
  return [
    "us-btn",
    variant !== "primary" ? `us-btn--${variant}` : "",
    size === "small" ? "us-btn--small" : "",
    block ? "us-btn--block" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  block,
  icon,
  children,
  className,
  loading = false,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="us-spinner" aria-hidden="true" />
      ) : icon ? (
        <Icon name={icon} size={20} />
      ) : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps & LinkProps;

export function ButtonLink({
  variant,
  size,
  block,
  icon,
  children,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classes({ variant, size, block, className })} {...rest}>
      {icon ? <Icon name={icon} size={20} /> : null}
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  icon,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: IconName;
}) {
  return (
    <button
      type="button"
      className={["us-btn", "us-btn--ghost", "us-btn--icon", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      {...rest}
    >
      <Icon name={icon} size={24} />
    </button>
  );
}
