import { Link } from "react-router";
import { Avatar } from "@/components/ui/UsAvatar";
import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { formatRelativeDate } from "@/lib/format";
import { fr } from "@/i18n/fr";
import type { ConversationListItem } from "@/types/listing";

export function ConversationList({
  items,
  activeId,
}: {
  items: ConversationListItem[];
  activeId?: string;
}) {
  return (
    <div className="thread-list">
      {items.map((item) => (
        <Link
          key={item._id}
          to={`/messages/${item._id}`}
          className={`thread-item${activeId === item._id ? " thread-item--active" : ""}`}
          aria-current={activeId === item._id ? "page" : undefined}
        >
          <Avatar name={item.other.displayName} />
          <span className="thread-item__body">
            <span className="thread-item__name">
              {item.other.displayName}
              {item.unreadCount > 0 ? (
                <>
                  <span className="thread-item__unread" aria-hidden="true" />
                  <span className="us-sr-only">
                    {fr.messages.unreadCount(item.unreadCount)}
                  </span>
                </>
              ) : null}
            </span>
            <span className="thread-item__listing">{item.listing.title}</span>
            <span
              className="thread-item__preview"
              data-unread={item.unreadCount > 0}
            >
              {item.lastMessage?.kind === "system"
                ? `${fr.messages.system} : ${item.lastMessage.body}`
                : (item.lastMessage?.body ?? fr.messages.noMessages)}
            </span>
          </span>
          <span className="thread-item__meta">
            <span className="thread-item__time">
              {formatRelativeDate(item.updatedAt)}
            </span>
            <span className="thread-item__thumb">
              <ListingPhoto
                photoUrl={item.listing.photoUrl}
                category={item.listing.category}
                alt=""
                variant="thumb"
              />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
