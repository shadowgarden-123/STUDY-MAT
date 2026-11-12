import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { fr } from "@/i18n/fr";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useAnalytics } from "@/lib/analytics";
import { useSession } from "@/auth/AuthContext";
import { startVisit } from "@/lib/visit";
import { formatRelativeDate } from "@/lib/format";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/UsButton";
import { ModePill } from "@/components/ui/Pills";
import { ListingPhoto } from "@/components/listings/ListingPhoto";

const USES = [
  {
    title: "Trouver ce qu'il te manque",
    text: "Cherche « Arduino », « polycopié L2 » ou « blouse » : les annonces du campus s'affichent avec leur lieu de remise, et tu vois tout de suite si l'objet est encore disponible.",
  },
  {
    title: "Donner ce qui dort chez toi",
    text: "Une photo, un titre, une catégorie : ton annonce est en ligne en deux étapes. Tu choisis la personne à qui tu remets l'objet, puis tu la marques comme donnée.",
  },
  {
    title: "Échanger sans laisser ton numéro",
    text: "Tout passe par la messagerie du site. Pas de paiement en ligne, pas de numéro affiché : l'argent, s'il y en a, circule de main en main à la remise.",
  },
];

const FACTS = [
  { title: "Entre étudiants", text: "Un même campus, des objets qui changent de sac." },
  { title: "Sans paiement en ligne", text: "Rien ne se règle sur le site, jamais." },
  { title: "Sans numéro exposé", text: "La messagerie remplace les échanges de contacts." },
];

/* Bandeau qui défile sous l'accroche : ce qui circule sur le campus. */
const TICKER = [
  "Livres de L1",
  "Polycopiés",
  "Cours et TD",
  "Composants",
  "Cartes Arduino",
  "Blouses de TP",
  "Calculatrices",
  "Matériel de labo",
  "Rapports reliés",
  "Clés USB",
];

export default function Welcome() {
  const navigate = useNavigate();
  const track = useAnalytics();
  const { isAuthenticated } = useSession();
  const listings = useQuery(api.listings.list, { limit: 3 });

  useDocumentMeta({
    title: "Univ-Share — donner, échanger, partager le matériel du campus",
    description:
      "Livres, cours, composants électroniques et matériel de labo entre étudiants. Trouve ou donne un objet utile en moins d'une minute.",
    path: "/",
  });

  const visit = () => {
    track("visit_home", { source: "visite-sans-compte" });
    startVisit();
    navigate("/annonces");
  };

  const { welcome } = fr.journey;
  const preview = listings?.items ?? [];

  /* Un membre qui arrive ici veut le fil, pas un formulaire d'inscription. */
  const actions = isAuthenticated ? (
    <>
      <ButtonLink to="/annonces" icon="search">
        {welcome.browse}
      </ButtonLink>
      <ButtonLink to="/publier" variant="secondary" icon="plus">
        {fr.actions.publish}
      </ButtonLink>
    </>
  ) : (
    <>
      <ButtonLink to="/inscription" icon="plus">
        {welcome.signup}
      </ButtonLink>
      <ButtonLink to="/connexion" variant="secondary">
        {welcome.login}
      </ButtonLink>
    </>
  );

  return (
    <div className="us-container landing">
      <div className="landing__shapes" aria-hidden="true">
        <span className="landing__shape landing__shape--a" />
        <span className="landing__shape landing__shape--b" />
        <span className="landing__shape landing__shape--c" />
        <span className="landing__shape landing__shape--d" />
        <span className="landing__shape landing__shape--e" />
      </div>

      <section className="landing__hero">
        <div className="landing__intro">
          <p className="us-eyebrow">{welcome.eyebrow}</p>
          <h1 className="landing__title">
            {welcome.title.split(" ").map((word, index) => (
              <span className="landing__word" key={`${word}-${index}`}>
                <span
                  className="landing__word-in"
                  style={{ animationDelay: `${60 + index * 60}ms` }}
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>
          <p className="landing__lead">
            Un livre de L1 qui dort dans un sac, une carte Arduino en double,
            une blouse de TP oubliée : Univ-Share remet ces objets en
            circulation entre étudiants, en don, en échange ou à petit prix.
          </p>

          <div className="landing__actions">{actions}</div>

          {isAuthenticated ? null : (
            <>
              <p className="us-caption landing__note">{welcome.note}</p>

              <button type="button" className="landing__visit" onClick={visit}>
                {welcome.visit}
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </div>

        <div className="landing__board-shell">
          <aside className="landing__board" aria-label="Le tableau du campus">
          <div className="landing__board-head">
            <h2 className="landing__board-title">Le tableau du campus</h2>
            <p className="landing__board-count">
              {listings
                ? `${listings.total} objets en circulation`
                : "On affiche les annonces…"}
            </p>
          </div>

          <ul className="landing__board-list">
            {preview.map((listing) => (
              <li className="landing__board-item" key={listing._id}>
                <span className="landing__board-photo">
                  <ListingPhoto
                    photoUrl={listing.photoUrl}
                    category={listing.category}
                    alt=""
                  />
                </span>
                <span className="landing__board-text">
                  <span className="landing__board-name">{listing.title}</span>
                  <span className="landing__board-meta">
                    <Icon name="pin" size={13} />
                    {listing.location}
                    <span aria-hidden="true">·</span>
                    {formatRelativeDate(listing.createdAt)}
                  </span>
                </span>
                <ModePill mode={listing.mode} price={listing.priceFcfa} />
              </li>
            ))}
          </ul>

          {preview.length === 0 ? (
            <p className="us-caption landing__board-empty">
              Le tableau se remplit à la rentrée : les premières annonces
              arrivent.
            </p>
          ) : null}

          <button type="button" className="landing__board-link" onClick={visit}>
            Parcourir les annonces
          </button>
          </aside>
        </div>
      </section>

      <div className="landing__ticker" aria-hidden="true">
        <div className="landing__ticker-track">
          <ul className="landing__ticker-list">
            {TICKER.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ul className="landing__ticker-list">
            {TICKER.map((item) => (
              <li key={`suite-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="landing__uses" aria-labelledby="landing-uses">
        <h2 className="landing__h2" id="landing-uses">
          À quoi ça sert
        </h2>
        <ul className="landing__use-list">
          {USES.map((use) => (
            <li className="landing__use" key={use.title}>
              <h3 className="landing__use-title">{use.title}</h3>
              <p className="landing__use-text">{use.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing__steps" aria-labelledby="landing-steps">
        <h2 className="landing__h2" id="landing-steps">
          Trois gestes, et l'objet change de sac.
        </h2>
        <ol className="landing__step-list">
          {welcome.proofs.map((proof, index) => (
            <li className="landing__step" key={proof.title}>
              <span className="landing__step-num" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className="landing__step-title">{proof.title}</h3>
                <p className="landing__step-text">{proof.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing__facts" aria-label="Ce que le site garantit">
        {FACTS.map((fact) => (
          <div className="landing__fact" key={fact.title}>
            <p className="landing__fact-title">{fact.title}</p>
            <p className="landing__fact-text">{fact.text}</p>
          </div>
        ))}
      </section>

      <div className="landing__ticker landing__ticker--reverse" aria-hidden="true">
        <div className="landing__ticker-track">
          <ul className="landing__ticker-list">
            {[...TICKER].reverse().map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ul className="landing__ticker-list">
            {[...TICKER].reverse().map((item) => (
              <li key={`suite-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="landing__final">
        <h2 className="landing__final-title">
          Ton sac cache peut-être le TP de quelqu'un.
        </h2>
        <p className="landing__final-text">
          Un polycopié oublié, une carte Arduino en trop : quelqu'un en a
          besoin cette semaine. Crée ton compte pour publier, ou pour
          contacter les personnes qui donnent.
        </p>
        <div className="landing__actions">{actions}</div>
        {isAuthenticated ? null : (
          <button type="button" className="landing__visit" onClick={visit}>
            {welcome.visit}
            <span aria-hidden="true">→</span>
          </button>
        )}
      </section>
    </div>
  );
}
