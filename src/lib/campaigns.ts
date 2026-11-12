export type Campaign = {
  id: string;
  tag: string;
  message: string;
  href: string;
  start: string;
  end: string;
};

/** Campagnes du campus : une seule active à la fois, fermable par l'étudiant. */
export const CAMPAIGNS: Campaign[] = [
  {
    id: "rentree-2026",
    tag: "Rentrée",
    message: "Le matériel de TP se trouve ici, pas dans trois groupes WhatsApp.",
    href: "/comment-ca-marche",
    start: "2026-09-15",
    end: "2026-11-30",
  },
  {
    id: "examens-2026",
    tag: "Examens",
    message: "Annales et fiches de révision : ce que les autres ont déjà fini.",
    href: "/?cat=cours",
    start: "2026-12-01",
    end: "2027-01-31",
  },
  {
    id: "fin-semestre-2027",
    tag: "Fin de semestre",
    message: "Vide ton sac : donne tes cours et tes composants avant de partir.",
    href: "/publier",
    start: "2027-05-15",
    end: "2027-07-15",
  },
];

export function activeCampaign(date: Date = new Date()): Campaign | null {
  const iso = date.toISOString().slice(0, 10);
  return (
    CAMPAIGNS.find((campaign) => iso >= campaign.start && iso <= campaign.end) ??
    null
  );
}
