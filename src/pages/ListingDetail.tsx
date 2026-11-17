import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/auth/AuthContext";
import { useAnalytics } from "@/lib/analytics";
import { toAppError } from "@/lib/errors";
import { formatLongDate, formatPrice, formatRelativeDate } from "@/lib/format";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { fr } from "@/i18n/fr";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/UsAvatar";
import { Button, ButtonLink } from "@/components/ui/UsButton";
import { Dialog } from "@/components/ui/UsDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingGridSkeleton } from "@/components/listings/ListingCard";
import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { CategoryPill, ModePill } from "@/components/ui/Pills";
import { useToast } from "@/components/ui/Toast";
import { GuestGate } from "@/components/auth/GuestGate";
import {
  dismissNudge,
  isNudging,
  subscribeNudge,
  trackListingVisit,
} from "@/lib/visit";
import { Icon } from "@/components/icons/Icon";
import type { ListingDetail as ListingDetailType } from "@/types/listing";

const REPORT_REASONS = [
  "inapproprie",
  "arnaque",
  "doublon",
  "autre",
] as const;

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const listingId = id as Id<"listings">;
  const validId = Boolean(id && /^[a-z0-9]+$/i.test(id));
  const listing = useQuery(
    api.listings.get,
    validId && id ? { id: listingId } : "skip",
  ) as ListingDetailType | null | undefined;

  const { isAuthenticated } = useSession();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const track = useAnalytics();

  const toggleFavorite = useMutation(api.listings.toggleFavorite);
  const startConversation = useMutation(api.conversations.start);
  const removeListing = useMutation(api.listings.remove);
  const reportListing = useMutation(api.listings.report);

  const [favoriteOverride, setFavoriteOverride] = useState<{
    id: string;
    value: boolean;
  } | null>(null);
  const saved =
    listing && favoriteOverride && favoriteOverride.id === listing._id
      ? favoriteOverride.value
      : (listing?.isFavorite ?? false);
  const [bouncing, setBouncing] = useState(false);
  const bounceTimer = useRef<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const nudge = useSyncExternalStore(subscribeNudge, isNudging, () => false);
  const [message, setMessage] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] =
    useState<(typeof REPORT_REASONS)[number]>("inapproprie");
  const [reportNote, setReportNote] = useState("");
  const [reportSending, setReportSending] = useState(false);

  useEffect(() => {
    if (listing?._id) track("view_listing", { value: listing._id });
  }, [listing?._id, track]);

  useEffect(() => {
    if (!listing?._id || isAuthenticated) return;
    trackListingVisit(listing._id);
  }, [listing?._id, isAuthenticated]);

  const jsonLd = useMemo(() => {
    if (!listing) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Offer",
      name: listing.title,
      description: listing.description,
      category: fr.categories[listing.category],
      availability:
        listing.status === "disponible"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      price: listing.priceFcfa ?? 0,
      priceCurrency: "XOF",
      url: `${window.location.origin}/annonce/${listing._id}`,
      seller: {
        "@type": "Person",
        name: listing.owner?.displayName ?? fr.common.student,
      },
    };
  }, [listing]);

  useDocumentMeta({
    title: listing
      ? `${listing.title} · ${fr.modes[listing.mode]} · Univ-Share`
      : "Annonce · Univ-Share",
    description: listing
      ? listing.description ||
        `${fr.modes[listing.mode]} — ${fr.categories[listing.category]}, ${listing.location}, campus.`
      : fr.brand.tagline,
    path: `/annonce/${id ?? ""}`,
    jsonLd,
  });

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      setGateOpen(true);
      return;
    }
    if (!listing) return;
    const next = !saved;
    setFavoriteOverride({ id: listing._id, value: next });
    setBouncing(true);
    if (bounceTimer.current) window.clearTimeout(bounceTimer.current);
    bounceTimer.current = window.setTimeout(() => setBouncing(false), 220);
    try {
      await toggleFavorite({ listingId: listing._id });
    } catch {
      setFavoriteOverride({ id: listing._id, value: !next });
      showToast(fr.listing.saveError);
    }
  };

  const openContact = () => {
    if (!listing) return;
    if (!isAuthenticated) {
      setGateOpen(true);
      return;
    }
    track("click_contact", { value: listing._id });
    setMessage(`Bonjour, ton ${listing.title} est toujours disponible ?`);
    setContactError(null);
    setContactOpen(true);
  };

  const sendContact = async () => {
    if (!listing) return;
    const trimmed = message.trim();
    if (!trimmed) {
      setContactError("Écris un message avant d'envoyer.");
      return;
    }
    setSending(true);
    setContactError(null);
    try {
      const conversationId = await startConversation({
        listingId: listing._id,
        body: trimmed,
      });
      track("first_message_sent", { value: listing._id });
      setContactOpen(false);
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      setContactError(toAppError(error).message);
    } finally {
      setSending(false);
    }
  };

  const share = async () => {
    if (!listing) return;
    track("share_click", { value: listing._id });
    const url = `${window.location.origin}/annonce/${listing._id}`;
    const text = fr.listing.shareMessage(listing.title, url);
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, text, url });
        return;
      } catch {
        return;
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const confirmDelete = async () => {
    if (!listing) return;
    setDeleting(true);
    try {
      await removeListing({ id: listing._id });
      showToast(fr.listing.deleted);
      navigate("/", { replace: true });
    } catch (error) {
      showToast(toAppError(error).message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const sendReport = async () => {
    if (!listing) return;
    setReportSending(true);
    try {
      await reportListing({
        listingId: listing._id,
        reason: reportReason,
        note: reportNote.trim() || undefined,
      });
      setReportOpen(false);
      setReportNote("");
      showToast(fr.listing.reportThanks);
    } catch (error) {
      showToast(
        toAppError(error).message || fr.listing.reportError,
      );
    } finally {
      setReportSending(false);
    }
  };

  if (!validId || listing === null) {
    return (
      <div className="us-container us-page">
        <PageHeader title={fr.listing.pageTitle} />
        <EmptyState
          title={fr.listing.notFound}
          text={fr.listing.notFoundText}
          action={<ButtonLink to="/">{fr.actions.newSearch}</ButtonLink>}
        />
      </div>
    );
  }

  if (listing === undefined) {
    return (
      <div className="us-container us-page" aria-busy="true">
        <PageHeader title={fr.listing.pageTitle} />
        <ListingGridSkeleton count={2} />
      </div>
    );
  }

  const isGiven = listing.status === "donne";
  const canContact = !listing.isOwner && !isGiven;

  return (
    <div className="us-container us-page">
      <PageHeader title={fr.listing.pageTitle} backTo="/" />

      <article className="detail">
        <div className="detail__media">
          <ListingPhoto
            photoUrl={listing.photoUrl}
            category={listing.category}
            alt={`Photo de l'annonce : ${listing.title}`}
            variant="detail"
            eager
          />
        </div>

        <div className="detail__content">
          {isGiven ? (
            <div className="us-banner us-banner--given" role="status">
              <Icon name="check" size={20} />
              <div>
                <p className="us-banner__title">{fr.listing.givenBanner}</p>
                <p>
                  {fr.listing.givenBannerText(
                    listing.isOwner ? listing.givenToName : null,
                  )}
                </p>
              </div>
            </div>
          ) : null}

          <div className="detail__tags">
            <ModePill mode={listing.mode} />
            <CategoryPill category={listing.category} />
            {isGiven ? (
              <span className="us-pill us-pill--status">{fr.common.given}</span>
            ) : null}
          </div>

          <h1 className="detail__title">{listing.title}</h1>

          <p className="detail__meta">
            <Icon name="pin" size={16} />
            <span>{listing.location}</span>
            <span aria-hidden="true">·</span>
            <span>
              {fr.listing.publishedLabel} {formatRelativeDate(listing.createdAt)}
            </span>
          </p>

          {listing.mode === "prix" && listing.priceFcfa !== null ? (
            <p className="detail__price">
              <span>{fr.listing.priceLabel} :</span>
              <strong>{formatPrice(listing.priceFcfa)}</strong>
            </p>
          ) : null}

          {listing.mode === "echange" && listing.exchangeWanted ? (
            <p className="detail__exchange">
              <strong>{fr.listing.exchangeLabel} :</strong>{" "}
              {listing.exchangeWanted}
            </p>
          ) : null}

          <p className="detail__desc">
            {listing.description || fr.listing.descriptionEmpty}
          </p>

          <div className="detail__toolbar">
            <Button variant="quiet" size="small" icon="share" onClick={share}>
              {fr.actions.share}
            </Button>
            {!listing.isOwner ? (
              <Button
                variant="quiet"
                size="small"
                icon="flag"
                onClick={() =>
                  isAuthenticated ? setReportOpen(true) : setGateOpen(true)
                }
              >
                {fr.actions.report}
              </Button>
            ) : null}
            <span className="us-caption">
              Publié le {formatLongDate(listing.createdAt)}
            </span>
          </div>

          <div className="us-tips">
            <p className="us-tips__head">
              <Icon name="shield" size={18} />
              {fr.listing.tipsTitle}
            </p>
            <ul>
              {fr.listing.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="detail__owner">
            <Avatar
              name={listing.owner?.displayName ?? fr.common.student}
              size="l"
            />
            <div>
              <p className="us-caption">{fr.listing.publishedBy}</p>
              <p className="detail__owner-name">
                {listing.owner?.displayName ?? fr.common.student}
              </p>
              <p className="detail__owner-meta">
                <span>{listing.owner?.level ?? "Campus"}</span>
                {listing.owner?.isVerifiedStudent ? (
                  <span className="us-badge">
                    <Icon name="check" size={12} />
                    {fr.common.verified}
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          {listing.isOwner ? (
            <div className="us-banner us-banner--yellow">
              <Icon name="info" size={20} />
              <div className="us-banner__body">
                <p className="us-banner__title">{fr.listing.ownerTitle}</p>
                <p>{fr.listing.ownerText}</p>
              </div>
            </div>
          ) : null}

          {!isAuthenticated && !listing.isOwner && nudge ? (
            <div className="us-banner us-banner--yellow" role="status">
              <Icon name="info" size={20} />
              <div className="us-banner__body">
                <p className="us-banner__title">{fr.journey.nudge.title}</p>
                <p>{fr.journey.nudge.text}</p>
                <div className="us-cluster" style={{ marginTop: 8 }}>
                  <Link
                    className="us-link"
                    to={`/inscription?returnTo=${encodeURIComponent(
                      `/annonce/${listing._id}`,
                    )}`}
                  >
                    {fr.journey.nudge.action}
                  </Link>
                  <button
                    type="button"
                    className="us-btn us-btn--ghost us-btn--small"
                    onClick={dismissNudge}
                  >
                    {fr.journey.nudge.later}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {listing.isOwner ? (
            <div className="detail__owner-actions">
              <ButtonLink
                to={`/publier/${listing._id}`}
                variant="secondary"
                icon="edit"
              >
                {fr.actions.modify}
              </ButtonLink>
              <Button
                variant="danger"
                icon="trash"
                onClick={() => setDeleteOpen(true)}
              >
                {fr.actions.delete}
              </Button>
            </div>
          ) : (
            <div className="detail__actions">
              <Button
                onClick={openContact}
                disabled={!canContact}
                title={!canContact ? fr.listing.givenContactDisabled : undefined}
              >
                <Icon name="message" size={20} />
                {canContact
                  ? fr.journey.interested
                  : fr.listing.givenContactDisabled}
              </Button>
              <Button
                variant="secondary"
                aria-pressed={saved}
                onClick={handleFavorite}
                className={bouncing ? "us-btn--bounced" : undefined}
              >
                <Icon name="bookmark" size={20} filled={saved} />
                {saved ? fr.actions.saved : fr.actions.save}
              </Button>
            </div>
          )}
        </div>
      </article>

      <Dialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={fr.listing.contactTitle}
      >
        <p className="us-caption">{fr.listing.contactIntro(listing.title)}</p>
        <p className="us-caption" style={{ marginTop: 4 }}>
          {fr.journey.interestedNote}
        </p>
        <div className="us-field" style={{ marginTop: 16 }}>
          <label className="us-field__label" htmlFor="contact-message">
            {fr.listing.contactLabel}
          </label>
          <textarea
            id="contact-message"
            className="us-textarea"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              if (contactError) setContactError(null);
            }}
            rows={4}
            maxLength={1000}
            aria-invalid={contactError ? true : undefined}
            aria-describedby={contactError ? "contact-error" : undefined}
          />
          {contactError ? (
            <p className="us-field__error" id="contact-error" role="alert">
              <Icon name="alert" size={16} />
              {contactError}
            </p>
          ) : null}
        </div>
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setContactOpen(false)}>
            {fr.actions.cancel}
          </Button>
          <Button onClick={sendContact} loading={sending}>
            {fr.listing.contactSubmit}
          </Button>
        </div>
      </Dialog>

      <GuestGate open={gateOpen} onClose={() => setGateOpen(false)} />

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={fr.listing.deleteTitle}
      >
        <p>{fr.listing.deleteText}</p>
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            {fr.actions.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            loading={deleting}
          >
            {fr.listing.deleteConfirm}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={fr.listing.reportTitle}
        variant="sheet"
      >
        <p className="us-caption">{fr.listing.reportIntro}</p>
        <fieldset className="us-field" style={{ marginTop: 16, border: 0, padding: 0 }}>
          <legend className="us-field__label">Motif</legend>
          <div className="report-options">
            {REPORT_REASONS.map((reason) => (
              <label className="report-option" key={reason}>
                <input
                  type="radio"
                  name="report-reason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={() => setReportReason(reason)}
                />
                <span>{fr.listing.reportReasons[reason]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="us-field" style={{ marginTop: 16 }}>
          <label className="us-field__label" htmlFor="report-note">
            {fr.listing.reportNote}
          </label>
          <textarea
            id="report-note"
            className="us-textarea"
            value={reportNote}
            onChange={(event) => setReportNote(event.target.value)}
            maxLength={300}
            rows={3}
          />
        </div>
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setReportOpen(false)}>
            {fr.actions.cancel}
          </Button>
          <Button onClick={sendReport} loading={reportSending}>
            {fr.listing.reportSubmit}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
