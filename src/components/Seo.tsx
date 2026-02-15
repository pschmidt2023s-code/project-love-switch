import { useEffect } from "react";

function upsertMeta(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function Seo({
  title,
  description,
  canonicalPath,
  ogImage,
}: {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
}) {
  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", description);
    const origin = "https://aldenairperfumes.de";
    const canonical = `${origin}${canonicalPath}`;
    upsertCanonical(canonical);

    // Open Graph
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    if (ogImage) {
      upsertMeta("property", "og:image", ogImage.startsWith("http") ? ogImage : `${origin}${ogImage}`);
    }

    // Twitter
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
  }, [title, description, canonicalPath, ogImage]);

  return null;
}
