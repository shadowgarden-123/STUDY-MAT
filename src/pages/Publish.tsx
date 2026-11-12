import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CAMPUS_LOCATIONS, type Category, type Mode } from "@/convex/config/campus";
import { useSession } from "@/auth/AuthContext";
import { useAnalytics } from "@/lib/analytics";
import { suggestCategory } from "@/lib/categoryHints";
import { compressImage } from "@/lib/compressImage";
import { toAppError, type FieldErrors } from "@/lib/errors";
import { formatPriceInput, parsePriceInput } from "@/lib/format";
import { useOnline } from "@/lib/useOnline";
import { fr } from "@/i18n/fr";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/UsButton";
import { Dialog } from "@/components/ui/UsDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";
import { SelectField, TextField, TextareaField } from "@/components/ui/Fields";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/icons/Icon";
import type { ListingDetail } from "@/types/listing";

const DRAFT_KEY = "univ-share:publish-draft";
const LAST_LOCATION_KEY = "univ-share:last-location";

type Draft = {
  mode: Mode;
  title: string;
  category: Category | "";
  price: string;
  exchange: string;
  location: string;
  description: string;
};

const EMPTY_DRAFT: Draft = {
  mode: "don",
  title: "",
  category: "",
  price: "",
  exchange: "",
  location: "",
  description: "",
};

const STEP_ONE_FIELDS = ["title", "description"];

function readDraft(): Draft {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return {
      ...EMPTY_DRAFT,
      ...parsed,
      mode: parsed.mode === "echange" || parsed.mode === "prix" ? parsed.mode : "don",
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

function readLastLocation(): string {
  try {
    const value = window.localStorage.getItem(LAST_LOCATION_KEY);
    return CAMPUS_LOCATIONS.includes(value as (typeof CAMPUS_LOCATIONS)[number])
      ? (value as string)
      : "";
  } catch {
    return "";
  }
}

function validateStepOne(draft: Draft): FieldErrors {
  const errors: FieldErrors = {};
  const title = draft.title.trim();
  if (title.length < 3 || title.length > 80) {
    errors.title = "Le titre doit faire entre 3 et 80 caractères.";
  }
  if (draft.description.length > 1000) {
    errors.description = "La description ne peut pas dépasser 1000 caractères.";
  }
  return errors;
}

function validate(draft: Draft): FieldErrors {
  const errors: FieldErrors = { ...validateStepOne(draft) };
  if (!draft.category) errors.category = fr.publish.categoryRequired;
  if (!draft.location) errors.location = fr.publish.locationRequired;
  if (draft.mode === "prix") {
    const price = parsePriceInput(draft.price);
    if (price === null || price < 100 || price > 50_000) {
      errors.price = "Le prix doit être entre 100 et 50 000 FCFA.";
    }
  }
  if (draft.mode === "echange" && draft.exchange.length > 120) {
    errors.exchange = "120 caractères maximum pour l'échange recherché.";
  }
  return errors;
}

function uploadPhoto(
  blob: Blob,
  generateUploadUrl: () => Promise<string>,
  onProgress: (percent: number) => void,
): Promise<Id<"_storage">> {
  return new Promise((resolve, reject) => {
    generateUploadUrl()
      .then((url) => {
        const request = new XMLHttpRequest();
        request.open("POST", url);
        request.setRequestHeader("Content-Type", blob.type);
        request.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        request.onload = () => {
          if (request.status < 200 || request.status >= 300) {
            reject(new Error("Upload refusé"));
            return;
          }
          try {
            const payload = JSON.parse(request.responseText) as {
              storageId?: Id<"_storage">;
            };
            if (!payload.storageId) throw new Error("Réponse sans identifiant");
            onProgress(100);
            resolve(payload.storageId);
          } catch {
            reject(new Error("Réponse d'upload invalide"));
          }
        };
        request.onerror = () => reject(new Error("Réseau indisponible"));
        request.send(blob);
      })
      .catch(reject);
  });
}

export default function Publish() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { profile } = useSession();
  const track = useAnalytics();
  const { showToast } = useToast();
  const online = useOnline();

  const validId = Boolean(id && /^[a-z0-9]+$/i.test(id));
  const existing = useQuery(
    api.listings.get,
    validId && id ? { id: id as Id<"listings"> } : "skip",
  ) as ListingDetail | null | undefined;

  const createListing = useMutation(api.listings.create);
  const updateListing = useMutation(api.listings.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<Draft>(() =>
    isEditing
      ? EMPTY_DRAFT
      : { ...readDraft(), location: readDraft().location || readLastLocation() },
  );
  const [restoredDraft] = useState(
    () => !isEditing && Boolean(window.sessionStorage.getItem(DRAFT_KEY)),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [photo, setPhoto] = useState<{
    blob: Blob;
    previewUrl: string;
  } | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    track("publish_started", { value: isEditing ? "edit" : "new" });
    if (restoredDraft) showToast(fr.publish.draftRestored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isEditing || !existing || hydrated.current) return;
    hydrated.current = true;
    setDraft({
      mode: existing.mode,
      title: existing.title,
      category: existing.category,
      price: existing.priceFcfa ? formatPriceInput(existing.priceFcfa) : "",
      exchange: existing.exchangeWanted ?? "",
      location: existing.location,
      description: existing.description,
    });
    setExistingPhotoUrl(existing.photoUrl);
  }, [isEditing, existing]);

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    };
  }, [photo]);

  useEffect(() => {
    if (isEditing) return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* le brouillon est un confort, pas une condition de publication */
    }
  }, [draft, isEditing]);

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setFormError(null);
  };

  const suggestion = useMemo(
    () => (draft.title.length >= 3 ? suggestCategory(draft.title) : null),
    [draft.title],
  );

  const onPickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setFormError(null);
    try {
      const compressed = await compressImage(file);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      setPhoto({ blob: compressed.blob, previewUrl: compressed.previewUrl });
      setRemovePhoto(false);
    } catch {
      setFormError(fr.publish.photoCompressError);
    }
  };

  const clearPhoto = () => {
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    setPhoto(null);
    if (existingPhotoUrl) setRemovePhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const goToStepTwo = () => {
    const stepErrors = validateStepOne(draft);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      const firstKey = Object.keys(stepErrors)[0];
      document.getElementById(`publish-${firstKey}`)?.focus();
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(draft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      if (STEP_ONE_FIELDS.includes(firstKey)) setStep(1);
      document.getElementById(`publish-${firstKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    setFormError(null);
    let photoStorageId: Id<"_storage"> | undefined;
    try {
      if (photo) {
        setUploading(true);
        setProgress(0);
        photoStorageId = await uploadPhoto(
          photo.blob,
          () => generateUploadUrl({}),
          setProgress,
        );
      }

      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category as Category,
        mode: draft.mode,
        priceFcfa:
          draft.mode === "prix"
            ? (parsePriceInput(draft.price) ?? undefined)
            : undefined,
        exchangeWanted:
          draft.mode === "echange" && draft.exchange.trim()
            ? draft.exchange.trim()
            : undefined,
        location: draft.location,
        photoStorageId,
      };

      if (isEditing && id) {
        await updateListing({
          id: id as Id<"listings">,
          ...payload,
          removePhoto: removePhoto && !photoStorageId,
        });
        try {
          window.sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          /* rien à nettoyer */
        }
        showToast(fr.publish.successEdit);
        navigate(`/annonce/${id}`, { replace: true });
      } else {
        const listingId = await createListing({
          ...payload,
          publishDurationMs: Date.now() - startedAt.current,
        });
        try {
          window.sessionStorage.removeItem(DRAFT_KEY);
          if (draft.location) {
            window.localStorage.setItem(LAST_LOCATION_KEY, draft.location);
          }
        } catch {
          /* préférences locales indisponibles */
        }
        track("publish_succeeded", { value: "new" });
        showToast(fr.publish.success);
        navigate(`/annonce/${listingId}`, { replace: true });
      }
    } catch (error) {
      const appError = toAppError(error);
      const fieldMap: Record<string, string> = {
        priceFcfa: "price",
        exchangeWanted: "exchange",
      };
      const mapped: FieldErrors = {};
      for (const [key, message] of Object.entries(appError.fields ?? {})) {
        mapped[fieldMap[key] ?? key] = message;
      }
      if (Object.keys(mapped).length > 0) setErrors(mapped);
      setFormError(isEditing ? fr.publish.errorEdit : fr.publish.error);
      const firstKey = Object.keys(mapped)[0] ?? null;
      if (firstKey) {
        if (STEP_ONE_FIELDS.includes(firstKey)) setStep(1);
        document.getElementById(`publish-${firstKey}`)?.focus();
      }
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (isEditing && !validId) {
    return (
      <div className="us-container us-page">
        <PageHeader title={fr.publish.editPageTitle} backTo="/profil" />
        <EmptyState
          title={fr.listing.notFound}
          text={fr.listing.notFoundText}
          action={<ButtonLink to="/profil">{fr.nav.profile}</ButtonLink>}
        />
      </div>
    );
  }

  if (isEditing && existing === null) {
    return (
      <div className="us-container us-page">
        <PageHeader title={fr.publish.editPageTitle} backTo="/profil" />
        <EmptyState
          title={fr.listing.notFound}
          text={fr.listing.notFoundText}
          action={<ButtonLink to="/profil">{fr.nav.profile}</ButtonLink>}
        />
      </div>
    );
  }

  if (isEditing && existing && !existing.isOwner) {
    return (
      <div className="us-container us-page">
        <PageHeader title={fr.publish.editPageTitle} backTo="/annonces" />
        <EmptyState
          title="Cette annonce n'est pas la tienne."
          text="Seul le propriétaire peut modifier une annonce."
          action={
            <ButtonLink to={`/annonce/${existing._id}`}>
              {fr.actions.seeListing}
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const previewUrl = photo?.previewUrl ?? (removePhoto ? null : existingPhotoUrl);
  const firstNameValue = profile?.displayName?.split(" ")[0];

  return (
    <div className="us-container us-page">
      <PageHeader
        title={isEditing ? fr.publish.editPageTitle : fr.publish.pageTitle}
        backTo="/annonces"
      />
      <div className="publish">
        <div className="publish__intro">
          <h1>{isEditing ? fr.publish.editPageTitle : fr.publish.pageTitle}</h1>
          <p className="us-muted">
            {step === 1 ? fr.publish.stepOneLead : fr.publish.stepTwoLead}
          </p>
          {!online ? (
            <p className="us-banner us-banner--yellow" role="status">
              <Icon name="offline" size={18} />
              {fr.publish.offlineKept}
            </p>
          ) : null}
        </div>

        <div className="publish__steps" aria-hidden="true">
          <span className={step === 1 ? "is-current" : "is-done"}>1</span>
          <span className="publish__steps-line" />
          <span className={step === 2 ? "is-current" : ""}>2</span>
        </div>
        <p className="us-caption publish__step-label">
          {fr.publish.stepLabel(step)}
        </p>

        {formError ? (
          <p className="us-banner us-banner--yellow" role="alert">
            <Icon name="alert" size={20} />
            <span className="us-banner__body">{formError}</span>
          </p>
        ) : null}

        <form className="publish__form" onSubmit={submit} noValidate>
          {step === 1 ? (
            <>
              <fieldset className="publish__fieldset">
                <legend className="publish__legend">
                  <span className="publish__legend-num">01</span>
                  {fr.publish.photoLegend}
                </legend>
                <input
                  ref={fileInputRef}
                  id="publish-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label={fr.publish.photoAdd}
                  className="us-sr-only"
                  onChange={(event) => onPickPhoto(event.target.files?.[0])}
                />
                {previewUrl ? (
                  <div>
                    <div className="photo-preview">
                      <img
                        src={previewUrl}
                        alt="Aperçu de la photo de ton annonce"
                        width={1200}
                        height={675}
                      />
                      <button
                        type="button"
                        className="photo-preview__remove"
                        onClick={clearPhoto}
                      >
                        <Icon name="close" size={16} />
                        {fr.publish.photoRemove}
                      </button>
                    </div>
                    <div className="publish__photo-actions">
                      <Button
                        variant="quiet"
                        size="small"
                        icon="camera"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {fr.publish.photoChange}
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => setTipsOpen(true)}
                      >
                        {fr.publish.photoTips}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="photo-drop"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="camera" size={32} />
                    <span className="photo-drop__title">{fr.publish.photoAdd}</span>
                    <span className="photo-drop__hint">{fr.publish.photoHint}</span>
                    <span className="photo-drop__hint">
                      {fr.publish.photoFormats}
                    </span>
                  </button>
                )}
                {uploading ? (
                  <div>
                    <p className="us-caption" aria-live="polite">
                      {fr.publish.uploadProgress(progress)}
                    </p>
                    <div
                      className="upload-progress"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-label="Envoi de la photo"
                    >
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : null}
              </fieldset>

              <TextField
                id="publish-title"
                label={fr.publish.titleLegend}
                placeholder={fr.publish.titlePlaceholder}
                value={draft.title}
                maxLength={80}
                error={errors.title}
                onChange={(event) => setField("title", event.target.value)}
                autoComplete="off"
                enterKeyHint="next"
              />

              <TextareaField
                id="publish-description"
                label={fr.publish.descriptionLegend}
                placeholder={fr.publish.descriptionPlaceholder}
                hint={fr.publish.descriptionHint}
                value={draft.description}
                error={errors.description}
                maxLength={1000}
                rows={5}
                counter={{ current: draft.description.length, max: 1000 }}
                onChange={(event) => setField("description", event.target.value)}
              />
            </>
          ) : (
            <>
              <fieldset className="publish__fieldset">
                <legend className="publish__legend">
                  <span className="publish__legend-num">01</span>
                  {fr.publish.intentLegend}
                </legend>
                <Segmented
                  label={fr.publish.intentLegend}
                  value={draft.mode}
                  onChange={(value) => setField("mode", value)}
                  options={[
                    { value: "don", label: fr.modes.don },
                    { value: "echange", label: fr.modes.echange },
                    { value: "prix", label: fr.modes.prix },
                  ]}
                />
                <p className="us-field__hint">
                  {fr.modeExplanations[draft.mode]}
                </p>
              </fieldset>

              {draft.mode === "prix" ? (
                <TextField
                  id="publish-price"
                  label={fr.publish.priceLegend}
                  placeholder={fr.publish.pricePlaceholder}
                  value={draft.price}
                  error={errors.price}
                  hint={fr.publish.priceHint}
                  inputMode="numeric"
                  autoComplete="off"
                  onChange={(event) => setField("price", event.target.value)}
                />
              ) : null}

              {draft.mode === "echange" ? (
                <TextField
                  id="publish-exchange"
                  label={fr.publish.exchangeLegend}
                  placeholder={fr.publish.exchangePlaceholder}
                  value={draft.exchange}
                  error={errors.exchange}
                  optional
                  maxLength={120}
                  onChange={(event) => setField("exchange", event.target.value)}
                />
              ) : null}

              <SelectField
                id="publish-category"
                label={fr.publish.categoryLegend}
                placeholder={fr.publish.categoryPlaceholder}
                value={draft.category}
                error={errors.category}
                onChange={(event) =>
                  setField("category", event.target.value as Category)
                }
                options={[
                  { value: "livres", label: fr.categories.livres },
                  { value: "cours", label: fr.categories.cours },
                  { value: "electronique", label: fr.categories.electronique },
                  { value: "labo", label: fr.categories.labo },
                ]}
              />

              {suggestion && suggestion !== draft.category ? (
                <div className="suggestion">
                  <span>{fr.publish.suggestion(fr.categories[suggestion])}</span>
                  <button
                    type="button"
                    className="suggestion__apply"
                    onClick={() => setField("category", suggestion)}
                  >
                    <Icon name="sparkle" size={16} />
                    {fr.actions.apply}
                  </button>
                </div>
              ) : null}

              <SelectField
                id="publish-location"
                label={fr.publish.locationLegend}
                placeholder={fr.publish.locationPlaceholder}
                value={draft.location}
                error={errors.location}
                onChange={(event) => setField("location", event.target.value)}
                options={CAMPUS_LOCATIONS.map((location) => ({
                  value: location,
                  label: location,
                }))}
              />
            </>
          )}

          <div className="publish__footer">
            {step === 1 ? (
              <Button type="button" block onClick={goToStepTwo}>
                {fr.publish.continue}
                <Icon name="chevron-right" size={18} />
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  block
                  loading={submitting}
                  disabled={!online}
                >
                  {submitting
                    ? uploading
                      ? fr.publish.uploadProgress(progress)
                      : isEditing
                        ? fr.publish.saving
                        : fr.publish.submitting
                    : isEditing
                      ? fr.publish.submitEdit
                      : fr.publish.submit}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  block
                  onClick={() => setStep(1)}
                >
                  {fr.publish.backToFirst}
                </Button>
              </>
            )}
            <p className="publish__footer-note">
              <Icon name="shield" size={14} />
              {firstNameValue
                ? fr.publish.identityNote(firstNameValue)
                : "Aucun numéro exposé"}
            </p>
          </div>
        </form>
      </div>

      <Dialog
        open={tipsOpen}
        onClose={() => setTipsOpen(false)}
        title={fr.publish.photoTipsTitle}
        variant="sheet"
      >
        <ul className="us-prose" style={{ gap: 12 }}>
          {fr.publish.photoTipsList.map((tip) => (
            <li key={tip} style={{ paddingLeft: 20 }}>
              {tip}
            </li>
          ))}
        </ul>
        <div className="us-dialog__actions">
          <Button onClick={() => setTipsOpen(false)}>
            {fr.publish.photoTipsClose}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
