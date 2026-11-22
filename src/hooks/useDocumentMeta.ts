import { useEffect } from 'react';

interface DocumentMetaOptions {
  title: string;
  description?: string;
  structuredData?: Record<string, unknown> | null;
}

/**
 * Updates document <title>, meta description, and optional JSON-LD structured data per route.
 */
export function useDocumentMeta({ title, description, structuredData }: DocumentMetaOptions) {
  useEffect(() => {
    document.title = `${title} — AKSHARA LIFESTYLE`;
    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    const scriptId = 'akshara-structured-data';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    if (structuredData) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [title, description, structuredData]);
}
