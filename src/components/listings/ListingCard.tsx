import { Link } from "react-router";
import { Icon } from "@/components/icons/Icon";
import { CategoryPill, ModePill } from "@/components/ui/Pills";
import { ListingPhoto } from "./ListingPhoto";
import { formatRelativeDate } from "@/lib/format";
import type { ListingSummary } from "@/types/listing";
import { fr } from "@/i18n/fr";

export function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <article className="us-listing-card">
      <div className="us-listing-card__media">
        <ListingPhoto
          photoUrl={listing.photoUrl}
          category={listing.category}
          alt=""
        />
      </div>
      <div className="us-listing-card__body">
        <div className="us-listing-card__tags">
          <ModePill mode={listing.mode} price={listing.priceFcfa} />
          <CategoryPill category={listing.category} />
        </div>
        <h3 className="us-listing-card__title">
          <Link
            to={`/annonce/${listing._id}`}
            className="us-listing-card__title-link"
          >
            {listing.title}
          </Link>
        </h3>
        <p className="us-listing-card__meta">
          <Icon name="pin" size={14} />
          <span>{listing.location}</span>
          <span aria-hidden="true">·</span>
          <span>{formatRelativeDate(listing.createdAt)}</span>
        </p>
      </div>
    </article>
  );
}

export function ListingCardSkeletonRow() {
  return (
    <div className="us-skel-card" aria-hidden="true">
      <div className="us-skel" style={{ width: 80, height: 80 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="us-skel" style={{ width: "56%", height: 20 }} />
        <div className="us-skel" style={{ width: "90%", height: 16 }} />
        <div className="us-skel" style={{ width: "62%", height: 12 }} />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="feed__grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeletonRow key={index} />
      ))}
    </div>
  );
}

export function listingLabel(listing: ListingSummary): string {
  return `${listing.title}, ${fr.modes[listing.mode]}, ${fr.categories[listing.category]}`;
}
