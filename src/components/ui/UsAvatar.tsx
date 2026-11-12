import { initials } from "@/lib/format";

export function Avatar({
  name,
  size = "m",
}: {
  name: string;
  size?: "s" | "m" | "l";
}) {
  return (
    <span
      className={["us-avatar", size !== "m" ? `us-avatar--${size}` : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
