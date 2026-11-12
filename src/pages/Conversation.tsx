import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fr } from "@/i18n/fr";
import { useAnalytics } from "@/lib/analytics";
import { formatTime } from "@/lib/format";
import { useOnline } from "@/lib/useOnline";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/UsAvatar";
import { Button, ButtonLink } from "@/components/ui/UsButton";
import { Dialog } from "@/components/ui/UsDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/icons/Icon";
import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { ConversationList } from "@/components/chat/ConversationList";
import { Composer } from "@/components/chat/Composer";
import { ListingGridSkeleton } from "@/components/listings/ListingCard";
import type { ConversationListItem, ThreadData } from "@/types/listing";

export default function Conversation() {
  const { id } = useParams<{ id: string }>();
  const conversationId = id as Id<"conversations">;
  const validId = Boolean(id && /^[a-z0-9]+$/i.test(id));
  const thread = useQuery(
    api.conversations.thread,
    validId && id ? { conversationId } : "skip",
  ) as ThreadData | null | undefined;
  const all = useQuery(api.conversations.list, { scope: "tout" }) as
    | ConversationListItem[]
    | undefined;

  const markRead = useMutation(api.conversations.markRead);
  const send = useMutation(api.conversations.send);
  const markGiven = useMutation(api.conversations.markGiven);
  const unmarkGiven = useMutation(api.conversations.unmarkGiven);
  const { showToast } = useToast();
  const track = useAnalytics();
  const online = useOnline();

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<string[]>([]);
  const [givenOpen, setGivenOpen] = useState(false);
  const [giving, setGiving] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [thanksOpen, setThanksOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef<number>(-1);

  useDocumentMeta({
    title: thread
      ? `${fr.messages.threadWith(thread.other.displayName)} · Univ-Share`
      : `${fr.messages.title} · Univ-Share`,
    path: `/messages/${id ?? ""}`,
  });

  useEffect(() => {
    if (!thread) return;
    if (markedRef.current === thread.messages.length) return;
    markedRef.current = thread.messages.length;
    markRead({ conversationId: thread._id }).catch(() => undefined);
  }, [thread, markRead]);

  useEffect(() => {
    const element = messagesRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [thread?.messages.length, pending.length]);

  const sendMessage = async () => {
    if (!thread) return;
    const text = body.trim();
    if (!text || sending) return;
    setBody("");
    setSending(true);
    setPending((current) => [...current, text]);
    try {
      await send({ conversationId: thread._id, body: text });
      setPending((current) => current.slice(1));
    } catch {
      setPending((current) => current.slice(1));
      setBody(text);
      showToast(fr.messages.sendError);
    } finally {
      setSending(false);
    }
  };

  const confirmGiven = async () => {
    if (!thread) return;
    setGiving(true);
    try {
      await markGiven({ conversationId: thread._id });
      setGivenOpen(false);
      setThanksOpen(true);
      track("mark_given", { value: thread.listing._id });
      showToast(fr.messages.markGivenDone, {
        actionLabel: fr.actions.cancel,
        onAction: async () => {
          try {
            await unmarkGiven({ conversationId: thread._id });
            showToast(fr.messages.unmarkDone);
          } catch {
            showToast(fr.messages.undoWindowPassed);
          }
        },
      });
    } catch {
      showToast(fr.messages.markGivenError);
    } finally {
      setGiving(false);
    }
  };

  const shareGift = async () => {
    if (!thread) return;
    const url = `${window.location.origin}/annonce/${thread.listing._id}`;
    const text = "Un objet a trouvé preneur sur Univ-Share. Et toi, qu'est-ce qui dort dans ton sac ?";
    if (navigator.share) {
      try {
        await navigator.share({ title: fr.messages.thanksTitle, text, url });
        return;
      } catch {
        return;
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const undoGiven = async () => {
    if (!thread) return;
    try {
      await unmarkGiven({ conversationId: thread._id });
      showToast(fr.messages.unmarkDone);
    } catch {
      showToast(fr.messages.undoWindowPassed);
    }
  };

  if (!validId || thread === null) {
    return (
      <div className="us-container us-page">
        <h1 className="us-sr-only">{fr.messages.title}</h1>
        <PageHeader title={fr.messages.title} backTo="/messages" />
        <EmptyState
          title={fr.messages.threadEmpty}
          text={fr.messages.threadEmptyText}
          action={<ButtonLink to="/messages">{fr.messages.backToMessages}</ButtonLink>}
        />
      </div>
    );
  }

  if (thread === undefined) {
    return (
      <div className="us-container us-page" aria-busy="true">
        <PageHeader title={fr.messages.title} backTo="/messages" />
        <ListingGridSkeleton count={3} />
      </div>
    );
  }

  const isGiven = thread.listing.status === "donne";

  return (
    <div className="us-container us-page">
      <h1 className="us-sr-only">
        {fr.messages.threadWith(thread.other.displayName)}
      </h1>
      <PageHeader title={fr.messages.title} backTo="/messages" />

      <div className="messages-shell">
        <aside className="messages-shell__list" aria-label={fr.messages.title}>
          <p className="us-eyebrow">{fr.messages.title}</p>
          {all && all.length > 0 ? (
            <ConversationList items={all} activeId={thread._id} />
          ) : (
            <p className="us-caption">{fr.messages.emptyTitle}</p>
          )}
        </aside>

        <div className="thread__wrap">
          <div className="thread">
            <div className="us-cluster" style={{ justifyContent: "space-between", gap: 12 }}>
              <div className="us-cluster">
                <Avatar name={thread.other.displayName} />
                <div>
                  <p className="detail__owner-name">{thread.other.displayName}</p>
                  <p className="us-caption">
                    {thread.other.level}
                    {thread.other.isVerifiedStudent ? (
                      <span className="us-badge" style={{ marginLeft: 8 }}>
                        <Icon name="check" size={12} />
                        {fr.common.verified}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="small"
                icon="shield"
                onClick={() => setTipsOpen(true)}
              >
                {fr.listing.tipsTitle}
              </Button>
            </div>

            <Link
              to={`/annonce/${thread.listing._id}`}
              className="thread__listing"
              style={{ marginTop: 12 }}
            >
              <span className="thread__listing-thumb">
                <ListingPhoto
                  photoUrl={thread.listing.photoUrl}
                  category={thread.listing.category}
                  alt=""
                  variant="thumb"
                />
              </span>
              <span className="thread__listing-body">
                <span className="thread__listing-title">
                  {thread.listing.title}
                </span>
                <span className="thread__listing-meta">
                  {isGiven ? fr.messages.listingGiven : fr.modes[thread.listing.mode]}
                  {" · "}
                  {fr.messages.openListing}
                </span>
              </span>
              <Icon name="chevron-right" size={18} />
            </Link>

            <div
              className="thread__messages"
              ref={messagesRef}
              role="log"
              aria-live="polite"
              aria-label={fr.messages.threadWith(thread.other.displayName)}
            >
              {thread.messages.map((message) =>
                message.kind === "system" ? (
                  <p className="msg msg--system" key={message._id}>
                    {message.body}
                  </p>
                ) : (
                  <div
                    className={`msg ${message.isMine ? "msg--out" : "msg--in"}`}
                    key={message._id}
                  >
                    <div className="msg__bubble">{message.body}</div>
                    <span className="msg__time">
                      {formatTime(message.createdAt)}
                      {message.isMine ? " · toi" : ""}
                    </span>
                  </div>
                ),
              )}
              {pending.map((text, index) => (
                <div className="msg msg--out" key={`pending-${index}`}>
                  <div className="msg__bubble">{text}</div>
                  <span className="msg__time">{fr.messages.sending}</span>
                </div>
              ))}
            </div>

            {!online ? (
              <p className="us-banner us-banner--yellow" role="status">
                <Icon name="offline" size={18} />
                {fr.offline.banner}
              </p>
            ) : null}
            <Composer
              value={body}
              onChange={setBody}
              onSend={sendMessage}
              sending={sending}
              disabled={!online}
            />

            {thread.isOwner ? (
              <div className="thread__give">
                {isGiven ? (
                  <div className="us-cluster">
                    <span className="thread__given">
                      <Icon name="check" size={18} />
                      {fr.messages.alreadyGiven}
                    </span>
                    {thread.canUndoGiven ? (
                      <Button variant="ghost" size="small" onClick={undoGiven}>
                        {fr.actions.cancel}
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <Button onClick={() => setGivenOpen(true)} icon="check">
                    {fr.actions.markGiven}
                  </Button>
                )}
              </div>
            ) : null}

            {isGiven && !thread.isOwner ? (
              <div className="us-banner us-banner--yellow" style={{ marginTop: 16 }}>
                <Icon name="sparkle" size={20} />
                <div className="us-banner__body">
                  <p>{fr.messages.reciprocity}</p>
                  <ButtonLink
                    to="/publier"
                    variant="ghost"
                    size="small"
                    icon="plus"
                  >
                    {fr.messages.reciprocityCta}
                  </ButtonLink>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog
        open={givenOpen}
        onClose={() => setGivenOpen(false)}
        title={fr.messages.markGivenTitle}
      >
        <p>{fr.messages.markGivenIntro(thread.other.displayName.split(" ")[0])}</p>
        <p className="us-caption" style={{ marginTop: 8 }}>
          {fr.messages.markGivenNote}
        </p>
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setGivenOpen(false)}>
            {fr.actions.cancel}
          </Button>
          <Button onClick={confirmGiven} loading={giving}>
            {fr.messages.markGivenConfirm}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={thanksOpen}
        onClose={() => setThanksOpen(false)}
        title={fr.messages.thanksTitle}
      >
        <p>{fr.messages.thanksText}</p>
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setThanksOpen(false)}>
            {fr.actions.close}
          </Button>
          <Button icon="share" onClick={shareGift}>
            {fr.messages.thanksShare}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={tipsOpen}
        onClose={() => setTipsOpen(false)}
        title={fr.listing.tipsTitle}
        variant="sheet"
      >
        <ul className="us-prose" style={{ gap: 12 }}>
          {fr.listing.tips.map((tip) => (
            <li key={tip} style={{ paddingLeft: 20 }}>
              {tip}
            </li>
          ))}
        </ul>
        <div className="us-dialog__actions">
          <Button onClick={() => setTipsOpen(false)}>{fr.actions.close}</Button>
        </div>
      </Dialog>
    </div>
  );
}
