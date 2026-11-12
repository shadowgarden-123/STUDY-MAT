import { useState } from "react";
import { fr } from "@/i18n/fr";
import { PageHeader } from "@/components/layout/PageHeader";
import { Logo, LogoLockup } from "@/components/icons/Logo";
import { Icon, type IconName } from "@/components/icons/Icon";
import {
  ArduinoArt,
  BookArt,
  HandoutArt,
  LabCoatArt,
  OpenBagArt,
} from "@/components/icons/Illustrations";
import { Button } from "@/components/ui/UsButton";
import { CategoryPill } from "@/components/ui/Pills";
import { Segmented } from "@/components/ui/Segmented";
import { SelectField, TextField, TextareaField } from "@/components/ui/Fields";
import { Dialog } from "@/components/ui/UsDialog";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingSummary } from "@/types/listing";
import type { Id } from "@/convex/_generated/dataModel";

const COLORS = [
  ["--color-green", "#0F6B4F", "Vert campus"],
  ["--color-green-hover", "#0A4F3A", "Vert survol"],
  ["--color-yellow", "#F5B800", "Jaune soleil"],
  ["--color-ink", "#14201B", "Encre"],
  ["--color-mint", "#DCEEE4", "Menthe"],
  ["--color-bg", "#F5F7F2", "Fond"],
  ["--color-muted", "#5B6B63", "Texte secondaire"],
  ["--color-line", "#DDE3DF", "Ligne"],
  ["--color-danger", "#B3261E", "Danger"],
] as const;

const ICON_NAMES: IconName[] = [
  "home",
  "search",
  "plus",
  "message",
  "user",
  "bell",
  "book",
  "doc",
  "chip",
  "flask",
  "arrow-left",
  "send",
  "bookmark",
  "check",
  "close",
  "camera",
  "pin",
  "share",
  "flag",
  "clock",
  "shield",
  "alert",
];

const SAMPLE: ListingSummary = {
  _id: "sample" as Id<"listings">,
  title: "Titre d'annonce sur deux lignes pour vérifier la coupure propre du texte",
  category: "electronique",
  mode: "prix",
  priceFcfa: 50_000,
  location: "Bâtiment B",
  status: "disponible",
  createdAt: Date.now() - 2 * 60 * 60 * 1000,
  photoUrl: null,
};

export default function Styleguide() {
  const [mode, setMode] = useState<"don" | "echange" | "prix">("don");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="us-container us-page">
      <PageHeader title="Styleguide" backTo="/" />
      <div className="styleguide">
        <div className="page-intro">
          <h1>{fr.styleguide.title}</h1>
          <p className="page-intro__lead">{fr.styleguide.lead}</p>
        </div>

        <section className="sg-section">
          <div className="sg-section__head">
            <h2>{fr.styleguide.logo}</h2>
            <p className="us-caption">
              Deux arcs, deux flèches, un point jaune : l'objet qui circule.
            </p>
          </div>
          <div className="sg-stack">
            <Logo href="/" />
            <Logo variant="symbol" size={48} />
            <LogoLockup />
          </div>
        </section>

        <section className="sg-section">
          <div className="sg-section__head">
            <h2>{fr.styleguide.colors}</h2>
          </div>
          <div className="sg-swatches">
            {COLORS.map(([token, hex, label]) => (
              <div className="sg-swatch" key={token}>
                <div
                  className="sg-swatch__color"
                  style={{ background: `var(${token})` }}
                />
                <div className="sg-swatch__label">
                  <strong>{label}</strong>
                  <span className="us-caption" style={{ display: "block" }}>
                    {hex} · {token}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sg-section">
          <div className="sg-section__head">
            <h2>{fr.styleguide.type}</h2>
            <p className="us-caption">
              Bricolage Grotesque 700 · Nunito Sans 400 et 700.
            </p>
          </div>
          <div className="us-stack">
            <p className="sg-type-display">Titre 32 px gras</p>
            <h2>Sous-titre 20 px gras</h2>
            <p>Texte courant 16 px, interlignage 1,5. Des phrases courtes, une idée par ligne.</p>
            <p className="us-caption">
              Légende 13 px pour les lieux, les dates et les états.
            </p>
          </div>
        </section>

        <section className="sg-section">
          <div className="sg-section__head">
            <h2>{fr.styleguide.icons}</h2>
            <p className="us-caption">Grille 24, trait 2 px, bouts arrondis.</p>
          </div>
          <div className="sg-icons">
            {ICON_NAMES.map((name) => (
              <span className="sg-icon" key={name}>
                <Icon name={name} />
                {name}
              </span>
            ))}
          </div>
        </section>

        <section className="sg-section">
          <div className="sg-section__head">
            <h2>{fr.styleguide.illustrations}</h2>
            <p className="us-caption">
              Cinq dessins à aplats, sans dégradé, utilisés quand il n'y a pas
              de photo.
            </p>
          </div>
          <div className="sg-grid">
            {[BookArt, ArduinoArt, HandoutArt, LabCoatArt, OpenBagArt].map(
              (Art, index) => (
                <div className="sg-swatch" key={index}>
                  <div style={{ padding: 12 }}>
                    <Art />
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="sg-section">
          <div className="sg-section__head">
            <h2>{fr.styleguide.components}</h2>
            <p className="us-caption">
              Une seule action principale en vert par écran.
            </p>
          </div>
          <div className="sg-stack" style={{ marginBottom: 16 }}>
            <Button>Contacter Yao</Button>
            <Button variant="secondary" icon="bookmark">
              Garder
            </Button>
            <Button variant="ghost">Annuler</Button>
            <Button variant="danger" icon="trash">
              Supprimer
            </Button>
            <Button disabled>Contacter Yao</Button>
          </div>
          <div className="sg-stack" style={{ marginBottom: 16 }}>
            <span className="us-pill us-pill--don">Don</span>
            <span className="us-pill us-pill--echange">Échange</span>
            <span className="us-pill us-pill--prix">Prix symbolique</span>
            <CategoryPill category="livres" />
            <CategoryPill category="cours" />
            <CategoryPill category="electronique" />
            <CategoryPill category="labo" />
          </div>
          <div className="sg-stack" style={{ marginBottom: 16 }}>
            <button type="button" className="us-chip" aria-pressed="true">
              Tout
            </button>
            <button type="button" className="us-chip" aria-pressed="false">
              Livres
            </button>
            <button type="button" className="us-chip us-chip--mode" aria-pressed="true">
              Don
            </button>
            <button type="button" className="us-chip us-chip--mode" aria-pressed="false">
              Échange
            </button>
          </div>
          <div style={{ maxWidth: 560, marginBottom: 16 }}>
            <Segmented
              label="Mode de l'annonce"
              value={mode}
              onChange={setMode}
              options={[
                { value: "don", label: fr.modes.don },
                { value: "echange", label: fr.modes.echange },
                { value: "prix", label: fr.modes.prix },
              ]}
            />
          </div>
          <div className="sg-grid" style={{ marginBottom: 16 }}>
            <TextField
              label="Titre de l'annonce"
              placeholder="Ex. : Kit Arduino Uno"
              hint="Une photo aide beaucoup."
              defaultValue=""
            />
            <TextField
              label="Titre en erreur"
              defaultValue="ar"
              error="Le titre doit faire entre 3 et 80 caractères."
            />
            <SelectField
              label="Catégorie"
              placeholder="Choisis une catégorie"
              options={[
                { value: "livres", label: "Livres" },
                { value: "cours", label: "Cours et TD" },
              ]}
            />
            <TextareaField
              label="Description"
              placeholder="Précise l'état et quand tu es disponible."
              counter={{ current: 42, max: 1000 }}
              defaultValue="Livre en bon état, avec quelques notes au crayon."
            />
          </div>
          <div className="sg-grid" style={{ marginBottom: 16 }}>
            {[196, 200, 201, 202].map((n) => (
              <ListingCard
                key={n}
                listing={{
                  ...SAMPLE,
                  _id: `sample-${n}` as Id<"listings">,
                  title:
                    n === 200
                      ? SAMPLE.title
                      : "Kit Arduino Uno et câbles",
                  mode: n % 2 === 0 ? "don" : "prix",
                }}
              />
            ))}
          </div>
          <div className="sg-stack">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Ouvrir un dialogue
            </Button>
            <div className="us-toast" style={{ position: "static", maxWidth: 360 }}>
              <Icon name="check" size={20} className="us-toast__icon" />
              <span>Ton annonce est en ligne</span>
            </div>
          </div>
        </section>

        <section className="sg-section">
          <div className="sg-section__head">
            <h2>{fr.styleguide.extremes}</h2>
            <p className="us-caption">
              Titre de 80 caractères, mot long, prix maximum, 0 annonce.
            </p>
          </div>
          <div className="us-stack">
            <h2 style={{ overflowWrap: "anywhere" }}>
              Anticonstitutionnellement-sur-dix-lignes-un-mot-très-long
            </h2>
            <p className="detail__price">
              <span>Prix symbolique :</span>
              <strong>50 000 FCFA</strong>
            </p>
            <div className="us-empty">
              <BookArt className="us-empty__art" />
              <p className="us-empty__title">{fr.home.emptyTitle}</p>
              <p className="us-empty__text">{fr.home.emptyText}</p>
              <Button>Publier une annonce</Button>
            </div>
          </div>
        </section>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Dialogue accessible"
      >
        <p>
          Le focus reste dans la boîte, Échap la ferme, et le focus revient au
          bouton d'origine.
        </p>
        <div className="us-dialog__actions">
          <Button variant="secondary" onClick={() => setDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={() => setDialogOpen(false)}>Confirmer</Button>
        </div>
      </Dialog>
    </div>
  );
}
