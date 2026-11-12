import { Illustration } from "@/components/icons/Illustrations";
import type { Category } from "@/convex/config/campus";

export function ListingPhoto({
  photoUrl,
  category,
  alt,
  variant = "card",
  eager = false,
}: {
  photoUrl: string | null;
  category: Category;
  alt: string;
  variant?: "thumb" | "card" | "detail";
  eager?: boolean;
}) {
  if (photoUrl) {
    const dimensions =
      variant === "detail"
        ? { width: 1200, height: 675 }
        : variant === "card"
          ? { width: 640, height: 480 }
          : { width: 160, height: 160 };
    return (
      <img
        src={photoUrl}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return <Illustration name={category} />;
}
