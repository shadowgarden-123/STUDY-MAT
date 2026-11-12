import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fr } from "@/i18n/fr";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/UsButton";
import { useToast } from "@/components/ui/Toast";
import { toAppError } from "@/lib/errors";
import { formatRelativeDate } from "@/lib/format";

export type ExchangeItem = {
  conversationId: Id<"conversations">;
  role: "proprietaire" | "demandeur";
  state: "a-convenir" | "termine";
  updatedAt: number;
  listing: {
    _id: Id<"listings">;
    title: string;
    status: string;
    photoUrl: string | null;
  };
  other: {
    _id: Id<"users">;
    displayName: string;
    level: string;
  };
};

export function ExchangeList({ items }: { items: ExchangeItem[] }) {
  const { showToast } = useToast();
  const markGiven = useMutation(api.conversations.markGiven);
  const [pending, setPending] = useState<string | null>(null);
  const { exchanges } = fr.journey;

  const onMarkGiven = async (conversationId: Id<"conversations">) => {
    setPending(conversationId);
    try {
      await markGiven({ conversationId });
      showToast(fr.messages.markGivenDone);
    } catch (error) {
      showToast(toAppError(error).message || fr.messages.markGivenError);
    } finally {
      setPending(null);
    }
  };

  return (
    <ul className="exchanges">
      {items.map((item) => (
        <li className="exchanges__item" key={item.conversationId}>
          <div className="exchanges__head">
            <span
              className={`us-pill exchanges__state exchanges__state--${item.state}`}
            >
              {item.state === "termine"
                ? exchanges.stateTermine
                : exchanges.stateAConvenir}
            </span>
            <span className="us-caption">
              {item.role === "proprietaire"
                ? exchanges.roleOwner
                : exchanges.roleRequester}
            </span>
          </div>

          <Link
            to={`/messages/${item.conversationId}`}
            className="exchanges__title"
          >
            {item.listing.title}
          </Link>

          <p className="us-caption exchanges__meta">
            <Icon name="user" size={14} />
            {exchanges.other(item.other.displayName)}
            <span aria-hidden="true">·</span>
            <span>{formatRelativeDate(item.updatedAt)}</span>
          </p>

          <div className="exchanges__actions">
            <Link
              to={`/messages/${item.conversationId}`}
              className="us-link"
            >
              {exchanges.open}
            </Link>
            {item.role === "proprietaire" && item.state === "a-convenir" ? (
              <Button
                size="small"
                variant="secondary"
                icon="check"
                loading={pending === item.conversationId}
                onClick={() => onMarkGiven(item.conversationId)}
              >
                {exchanges.markGiven}
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
