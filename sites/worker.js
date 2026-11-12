/**
 * Entrée Worker du site Univ-Share.
 *
 * L'application est une SPA entièrement statique : les données viennent du
 * déploiement Convex distant, appelé directement depuis le navigateur. Le
 * Worker ne fait donc que servir les fichiers produits par `vite build`, avec
 * un repli sur `index.html` pour les routes côté client (`/annonces`,
 * `/messages/:id`, etc.).
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
