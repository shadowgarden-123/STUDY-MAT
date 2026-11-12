const VISIT_KEY = "univ-share:visite";
const VIEWS_KEY = "univ-share:fiches-vues";
const NUDGE_KEY = "univ-share:relance-vue";
const NUDGE_AFTER = 3;

/* Petit store pour la relance : évite un setState dans un effet. */
let nudging = false;
let listeners: Array<() => void> = [];

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeNudge(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export function isNudging(): boolean {
  return nudging;
}

export function dismissNudge(): void {
  nudging = false;
  emit();
}

/** La personne a-t-elle choisi de visiter sans compte ? */
export function hasChosenVisit(): boolean {
  try {
    return window.sessionStorage.getItem(VISIT_KEY) === "1";
  } catch {
    return false;
  }
}

export function startVisit(): void {
  try {
    window.sessionStorage.setItem(VISIT_KEY, "1");
  } catch {
    /* sans stockage, la visite reste possible : elle repart de l'accueil */
  }
}

/**
 * Compte les fiches distinctes vues pendant la visite.
 * Renvoie true une seule fois, quand la troisième fiche est atteinte.
 */
export function trackListingVisit(listingId: string): boolean {
  try {
    if (window.sessionStorage.getItem(NUDGE_KEY) === "1") return false;
    const raw = window.sessionStorage.getItem(VIEWS_KEY);
    const seen: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!seen.includes(listingId)) seen.push(listingId);
    window.sessionStorage.setItem(VIEWS_KEY, JSON.stringify(seen.slice(-10)));
    if (seen.length >= NUDGE_AFTER) {
      window.sessionStorage.setItem(NUDGE_KEY, "1");
      nudging = true;
      emit();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
