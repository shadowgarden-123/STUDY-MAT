import type { Id } from "@/convex/_generated/dataModel";
import type { Category, Mode } from "@/convex/config/campus";

export type ListingStatus = "disponible" | "donne";

export type ListingSummary = {
  _id: Id<"listings">;
  title: string;
  category: Category;
  mode: Mode;
  priceFcfa: number | null;
  location: string;
  status: ListingStatus;
  createdAt: number;
  photoUrl: string | null;
};

export type ListingOwner = {
  _id: Id<"users">;
  displayName: string;
  level: string;
  isVerifiedStudent: boolean;
};

export type ListingDetail = ListingSummary & {
  description: string;
  exchangeWanted: string | null;
  givenAt: number | null;
  givenToName: string | null;
  isFavorite: boolean;
  isOwner: boolean;
  owner: ListingOwner | null;
};

export type ConversationListItem = {
  _id: Id<"conversations">;
  listing: {
    _id: Id<"listings">;
    title: string;
    category: Category;
    mode: Mode;
    priceFcfa: number | null;
    status: ListingStatus;
    photoUrl: string | null;
  };
  other: ListingOwner;
  role: "demandeur" | "proprietaire";
  lastMessage: { body: string; kind: "text" | "system"; createdAt: number } | null;
  unreadCount: number;
  updatedAt: number;
};

export type ThreadMessage = {
  _id: Id<"messages">;
  body: string;
  kind: "text" | "system";
  createdAt: number;
  isMine: boolean;
};

export type ThreadData = {
  _id: Id<"conversations">;
  isOwner: boolean;
  other: ListingOwner;
  listing: {
    _id: Id<"listings">;
    title: string;
    category: Category;
    mode: Mode;
    priceFcfa: number | null;
    status: ListingStatus;
    photoUrl: string | null;
  };
  messages: ThreadMessage[];
  canUndoGiven: boolean;
};

export type Profile = {
  _id: Id<"users">;
  email: string | null;
  displayName: string | null;
  level: string | null;
  isVerifiedStudent: boolean;
  needsOnboarding: boolean;
  listingsCount: number;
  givenCount: number;
  referralsCount: number;
};
