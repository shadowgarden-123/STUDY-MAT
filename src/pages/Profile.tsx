import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/auth/AuthContext";
import { fr } from "@/i18n/fr";
import { formatRelativeDate } from "@/lib/format";
import { Avatar } from "@/components/ui/UsAvatar";
import { Button, ButtonLink } from "@/components/ui/UsButton";
import { Dialog } from "@/components/ui/UsDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/Pills";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/icons/Icon";
import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { ListingGridSkeleton } from "@/components/listings/ListingCard";
import type {
  ConversationListItem,
  ListingSummary,
} from "@/types/listing";

export default function Profile() {
  const { profile, signOut } = useSession();
  const { showToast } = useToast();

  const mine = useQuery(api.listings.mine) as ListingSummary[] | undefined;
  const favorites = useQuery(api.listings.favorites) as
    | ListingSummary[]
    | undefined;
  const conversations = useQuery(api.conversations.list, {
    scope: "tout",
  }) as ConversationListItem[] | undefined;

  const removeListing = useMutation(api.listings.remove);
  const toggleFavorite = useMutation(api.listings.toggleFavorite);
  const markGiven = useMutation(api.conversations.markGiven);
  const deleteMe = useMutation(api.profile.deleteMe);

  const [deleteTarget, setDeleteTarget] = useState<ListingSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [givenTarget, setGivenTarget] = useState<ListingSummary | null>(null);
  const [givenConversation, setGivenConversation] = useState<string>("");
  const [giving, setGiving] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountDeleting, setAccountDeleting] = useState(false);

  const referralUrl = profile
    ? `${window.location.origin}/?ref=${profile._id}`
    : "";

  const interestedThreads = useMemo(() => {
    if (!givenTarget || !conversations) return [];
    return conversations.filter(
      (item) =>
        item.role === "proprietaire" && item.listing._id === givenTarget._id,
    );
  }, [givenTarget, conversations]);

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      showToast(fr.profile.referralCopied);
    } catch {
      showToast("Sélectionne le lien pour le copier.");
    }
  };

  const shareReferral = async () => {
    const text = "Rejoins Univ-Share, le matériel du campus circule entre étudiants.";
    if (navigator.share) {
      try {
        await navigator.share({ title: fr.brand.name, text, url: referralUrl });
        return;
      } catch {
        return;
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${referralUrl}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const confirmDeleteListing = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeListing({ id: deleteTarget._id });
      setDeleteTarget(null);
      showToast(fr.listing.deleted);
    } catch {
      showToast(fr.errors.generic);
    } finally {
      setDeleting(false);
    }
  };

  const openGiven = (listing: ListingSummary) => {
    const threads = (conversations ?? []).filter(
      (item) => item.role === "proprietaire" && item.listing._id === listing._id,
    );
    setGivenTarget(listing);
    setGivenConversation(threads[0]?._id ?? "");
  };

  const confirmGiven = async () => {
    if (!givenConversation) return;
    setGiving(true);
    try {
      await markGiven({
        conversationId: givenConversation as Id<"conversations">,
      });
      setGivenTarget(null);
      showToast(fr.listing.givenSuccess);
    } catch {
      showToast(fr.profile.markGivenError);
    } finally {
      setGiving(false);
    }
  };

  const confirmDeleteAccount = async () => {
    setAccountDeleting(true);
    try {
      await deleteMe({});
      setAccountOpen(false);
      try {
        await signOut();
      } catch {
        window.location.assign("/");
      }
      showToast("Ton compte a été supprimé.");
    } catch {
      setAccountDeleting(false);
      showToast(fr.profile.deleteAccountError);
    }
  };

  if (!profile) return null;

  return (
    <div className="us-container us-page">
      <div className="profile">
        <div className="profile__head">
          <Avatar name={profile.displayName ?? fr.common.student} size="l" />
          <div className="profile__identity">
            <h1 className="profile__name">
              {profile.displayName ?? fr.common.student}
            </h1>
            <p className="profile__meta">
              <span>{profile.level ?? "Campus"}</span>
              {profile.isVerifiedStudent ? (
                <span className="us-badge">
                  <Icon name="check" size={12} />
                  {fr.common.verified}
                </span>
              ) : null}
            </p>
            {profile.email ? (
              <p className="profile__email">{profile.email}</p>
            ) : null}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button
              variant="quiet"
              size="small"
              icon="logout"
              onClick={() => {
                signOut().catch(() => showToast(fr.profile.logoutError));
              }}
            >
              {fr.profile.logout}
            </Button>
          </div>
        </div>

        <div className="profile__meta">
          <span className="us-pill us-pill--categorie">
            {fr.profile.listingCount(profile.listingsCount)}
          </span>
          <span className="us-pill us-pill--categorie">
            {fr.profile.givenCount(profile.givenCount)}
          </span>
        </div>

        <section className="profile__section" aria-labelledby="my-listings">
          <div className="profile__section-head">
            <h2 className="profile__section-title" id="my-listings">
              {fr.profile.myListings}
            </h2>
            <ButtonLink to="/publier" variant="ghost" size="small" icon="plus">
              {fr.actions.publish}
            </ButtonLink>
          </div>

          {mine === undefined ? (
            <ListingGridSkeleton count={2} />
          ) : mine.length === 0 ? (
            <EmptyState
              title={fr.profile.noListings}
              text={fr.profile.noListingsText}
              action={<ButtonLink to="/publier">{fr.profile.publishCta}</ButtonLink>}
            />
          ) : (
            <div className="profile__rows">
              {mine.map((listing) => (
                <div className="profile__row" key={listing._id}>
                  <span className="profile__row-thumb">
                    <ListingPhoto
                      photoUrl={listing.photoUrl}
                      category={listing.category}
                      alt=""
                      variant="thumb"
                    />
                  </span>
                  <div className="profile__row-body">
                    <div className="us-cluster">
                      <StatusPill status={listing.status} />
                      <span className="us-caption">
                        {formatRelativeDate(listing.createdAt)}
                      </span>
                    </div>
                    <Link
                      to={`/annonce/${listing._id}`}
                      className="profile__row-title"
                    >
                      {listing.title}
                    </Link>
                    <div className="profile__row-actions">
                      <ButtonLink
                        to={`/publier/${listing._id}`}
                        variant="ghost"
                        size="small"
                        icon="edit"
                      >
                        {fr.actions.modify}
                      </ButtonLink>
                      {listing.status === "disponible" ? (
                        <Button
                          variant="ghost"
                          size="small"
                          icon="check"
                          onClick={() => openGiven(listing)}
                        >
                          {fr.actions.markGiven}
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="small"
                        icon="trash"
                        onClick={() => setDeleteTarget(listing)}
                      >
                        {fr.actions.delete}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="profile__section" aria-labelledby="my-saved">
          <div className="profile__section-head">
            <h2 className="profile__section-title" id="my-saved">
              {fr.profile.saved}
            </h2>
          </div>
          {favorites === undefined ? (
            <ListingGridSkeleton count={1} />
          ) : favorites.length === 0 ? (
            <EmptyState
              title={fr.profile.noSaved}
              text={fr.profile.noSavedText}
              action={<ButtonLink to="/">{fr.profile.browseCta}</ButtonLink>}
            />
          ) : (
            <div className="profile__rows">
              {favorites.map((listing) => (
                <div className="profile__row" key={listing._id}>
                  <span className="profile__row-thumb">
                    <ListingPhoto
                      photoUrl={listing.photoUrl}
                      category={listing.category}
                      alt=""
                      variant="thumb"
                    />
                  </span>
                  <div className="profile__row-body">
                    <Link
                      to={`/annonce/${listing._id}`}
                      className="profile__row-title"
                    >
                      {listing.title}
                    </Link>
                    <p className="us-caption">
                      {listing.location} · {formatRelativeDate(listing.createdAt)}
                    </p>
                    <div className="profile__row-actions">
                      <Button
                        variant="ghost"
                        size="small"
                        icon="bookmark"
                        onClick={async () => {
                          try {
                            await toggleFavorite({ listingId: listing._id });
                            showToast(fr.actions.unsave);
                          } catch {
                            showToast(fr.errors.generic);
                          }
                        }}
                      >
                        {fr.actions.unsave}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="profile__section" aria-labelledby="referral">
          <div className="profile__referral">
            <h2 className="profile__section-title" id="referral">
              {fr.profile.referralTitle}
            </h2>
            <p className="us-caption">{fr.profile.referralText}</p>
            <p className="us-badge" style={{ alignSelf: "flex-start" }}>
              {fr.profile.referralCount(profile.referralsCount)}
            </p>
            <div className="profile__referral-link">
              <label className="us-sr-only" htmlFor="referral-link">
                Ton lien d'invitation
              </label>
              <input
                id="referral-link"
                readOnly
                value={referralUrl}
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button variant="secondary" size="small" icon="copy" onClick={copyReferral}>
                {fr.profile.referralCopy}
              </Button>
              <Button variant="ghost" size="small" icon="share" onClick={shareReferral}>
                {fr.profile.referralShare}
              </Button>
            </div>
          </div>
        </section>

        <div className="profile__danger">
          <Button
            variant="danger"
            icon="trash"
            onClick={() => setAccountOpen(true)}
          >
            {fr.profile.deleteAccount}
          </Button>
          <p className="us-caption">
            Tes annonces, tes conversations et tes annonces gardées sont
            supprimées.{" "}
            <Link to="/confidentialite">{fr.nav.privacy}</Link>
          </p>
        </div>
      </div>

      <Dialog
        open={givenTarget !== null}
        onClose={() => setGivenTarget(null)}
        title={fr.profile.markGivenTitle}
      >
        <p className="us-caption">{fr.profile.markGivenIntro}</p>
        {interestedThreads.length === 0 ? (
          <p className="us-banner us-banner--yellow" style={{ marginTop: 16 }}>
            <Icon name="info" size={18} />
            {fr.profile.markGivenNoThreads}
          </p>
        ) : (
          <div className="report-options" style={{ marginTop: 16 }}>
            {interestedThreads.map((thread) => (
              <label className="report-option" key={thread._id}>
                <input
                  type="radio"
                  name="given-thread"
                  value={thread._id}
                  checked={givenConversation === thread._id}
                  onChange={() => setGivenConversation(thread._id)}
                />
                <span>
                  {thread.other.displayName} · {thread.other.level}
                </span>
              </label>
            ))}
          </div>
        )}
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setGivenTarget(null)}>
            {fr.actions.cancel}
          </Button>
          <Button
            onClick={confirmGiven}
            loading={giving}
            disabled={!givenConversation}
          >
            {fr.profile.markGivenConfirm}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={fr.profile.deleteListingTitle}
      >
        <p>{fr.profile.deleteListingText}</p>
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            {fr.actions.cancel}
          </Button>
          <Button variant="danger" onClick={confirmDeleteListing} loading={deleting}>
            {fr.actions.delete}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        title={fr.profile.deleteAccountTitle}
      >
        <p>{fr.profile.deleteAccountText}</p>
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setAccountOpen(false)}>
            {fr.actions.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteAccount}
            loading={accountDeleting}
          >
            {fr.profile.deleteAccountConfirm}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
