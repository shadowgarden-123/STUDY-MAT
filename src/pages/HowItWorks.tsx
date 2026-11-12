import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { fr } from "@/i18n/fr";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/UsButton";
import { ModePill } from "@/components/ui/Pills";
import { Icon } from "@/components/icons/Icon";
import { BookArt, HandoutArt, LabCoatArt } from "@/components/icons/Illustrations";

const STEP_ART = [HandoutArt, LabCoatArt, BookArt];

export default function HowItWorks() {
  const stats = useQuery(api.stats.publicStats);

  useDocumentMeta({
    title: "Comment ça marche · Univ-Share",
    description:
      "Publie en 2 minutes, sois contacté par un étudiant du campus, remets l'objet. Don, échange ou prix symbolique en FCFA.",
    path: "/comment-ca-marche",
  });

  const showStats =
    stats !== undefined &&
    (stats.availableCount >= 20 || stats.givenThisWeek >= 20);

  return (
    <div className="us-container us-page">
      <PageHeader title={fr.nav.howItWorks} />
      <div className="page-narrow">
        <div className="page-intro">
          <h1>{fr.how.title}</h1>
          <p className="page-intro__lead">{fr.how.lead}</p>
          {showStats ? (
            <p className="us-caption">
              {stats.availableCount} objets disponibles · {stats.givenThisWeek}{" "}
              donnés cette semaine.
            </p>
          ) : null}
        </div>

        <section aria-labelledby="trois-etapes">
          <h2 id="trois-etapes" style={{ marginBottom: 16 }}>
            {fr.how.stepsTitle}
          </h2>
          <div className="how-grid">
            {fr.how.steps.map((step, index) => {
              const Art = STEP_ART[index] ?? BookArt;
              return (
                <article className="how-card" key={step.title}>
                  <span className="step__num" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <Art className="how-card__art" />
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__text">{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="modes">
          <h2 id="modes" style={{ marginBottom: 16 }}>
            {fr.how.modesTitle}
          </h2>
          <div className="mode-explain">
            {(["don", "echange", "prix"] as const).map((mode) => (
              <div className="mode-explain__item" key={mode}>
                <ModePill mode={mode} />
                <p className="us-muted">{fr.modeExplanations[mode]}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="us-tips">
            <p className="us-tips__head">
              <Icon name="shield" size={18} />
              {fr.how.tipsTitle}
            </p>
            <ul>
              {fr.listing.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="faq">
          <h2 id="faq" style={{ marginBottom: 16 }}>
            {fr.how.faqTitle}
          </h2>
          <div className="faq">
            {fr.how.faq.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <Icon name="chevron-down" size={20} />
                </summary>
                <p className="faq__body">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="cta-band">
          <div className="us-stack">
            <h2>{fr.how.ctaTitle}</h2>
            <p>{fr.how.ctaText}</p>
            <div className="cta-band__actions">
              <ButtonLink to="/publier" variant="secondary" icon="plus">
                {fr.actions.publish}
              </ButtonLink>
              <ButtonLink to="/" variant="ghost">
                {fr.messages.emptyAction}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
