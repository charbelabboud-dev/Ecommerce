import { useEffect } from 'react';

function setMetaTag(selector, attr, name, content) {
  if (!content) return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function PageMeta({ title, description, path }) {
  useEffect(() => {
    const siteName = document.documentElement.dataset.siteName || 'Shop';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = fullTitle;

    if (description) {
      setMetaTag('meta[name="description"]', 'name', 'description', description);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    }

    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');

    if (path) {
      const url = `${window.location.origin}${path}`;
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
    }
  }, [title, description, path]);

  return null;
}

export default PageMeta;
