import { useEffect } from "react";

type MetaOptions = {
  title: string;
  description?: string;
  path?: string;
  jsonLd?: Record<string, unknown> | null;
};

function upsertMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

/** Titre, description, canonique et données structurées pour la page courante. */
export function useDocumentMeta({ title, description, path, jsonLd }: MetaOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
      upsertMeta(
        'meta[property="og:description"]',
        "property",
        "og:description",
        description,
      );
      upsertMeta(
        'meta[name="twitter:description"]',
        "name",
        "twitter:description",
        description,
      );
    }

    if (path) {
      const url = `${window.location.origin}${path}`;
      upsertCanonical(url);
      upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    }

    const scriptId = "univ-share-jsonld";
    document.getElementById(scriptId)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = previousTitle;
      document.getElementById(scriptId)?.remove();
    };
  }, [title, description, path, jsonLd]);
}
