import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { fr } from "@/i18n/fr";
import { ButtonLink } from "@/components/ui/UsButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";
import { ConversationList } from "@/components/chat/ConversationList";
import { ListingGridSkeleton } from "@/components/listings/ListingCard";
import type { ConversationListItem } from "@/types/listing";

type Scope = "tout" | "je-donne" | "je-cherche";

export default function Messages() {
  const [scope, setScope] = useState<Scope>("tout");
  const items = useQuery(api.conversations.list, { scope }) as
    | ConversationListItem[]
    | undefined;

  return (
    <div className="us-container us-page">
      <div className="messages-page">
        <div className="messages-page__intro">
          <h1 className="messages-page__title">{fr.messages.title}</h1>
          <p className="us-muted">{fr.messages.lead}</p>
        </div>

        <Segmented
          label="Filtrer les échanges"
          value={scope}
          onChange={setScope}
          options={[
            { value: "tout", label: fr.messages.filterAll },
            { value: "je-donne", label: fr.messages.filterGiving },
            { value: "je-cherche", label: fr.messages.filterAsking },
          ]}
        />

        {items === undefined ? (
          <ListingGridSkeleton count={3} />
        ) : items.length === 0 ? (
          <EmptyState
            title={
              scope === "tout"
                ? fr.messages.emptyTitle
                : fr.messages.emptyFilterTitle
            }
            text={
              scope === "tout"
                ? fr.messages.emptyText
                : fr.messages.emptyFilterText
            }
            action={
              scope === "tout" ? (
                <ButtonLink to="/">{fr.messages.emptyAction}</ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <ConversationList items={items} />
        )}
      </div>
    </div>
  );
}
