import { useEffect } from 'react';
import { getStoreSettings, getImageUrl } from '../services/api';

const THEME_COLOR = '#0c1f3d';
const FALLBACK_ICON = '/logo512.png';

function upsertLink(rel, href, attrs = {}) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value == null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  });
}

function applyManifest({ name, shortName, iconUrl }) {
  const manifest = {
    short_name: shortName,
    name,
    icons: [
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    start_url: '/',
    display: 'standalone',
    theme_color: THEME_COLOR,
    background_color: '#ffffff'
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
  const url = URL.createObjectURL(blob);
  upsertLink('manifest', url);
  return url;
}

function AppBranding() {
  useEffect(() => {
    let manifestUrl;

    const load = async () => {
      const origin = window.location.origin;
      const settings = await getStoreSettings();
      const storeName = settings?.storeName?.trim() || 'Shop';
      const shortName = storeName.length > 12 ? storeName.slice(0, 12).trim() : storeName;
      const storeLogo = settings?.storeLogo ? getImageUrl(settings.storeLogo) : null;
      const iconUrl = storeLogo || `${origin}${FALLBACK_ICON}`;

      document.documentElement.dataset.siteName = storeName;

      if (storeLogo) {
        upsertLink('icon', storeLogo, { type: 'image/png' });
      } else {
        upsertLink('icon', `${origin}/icon.svg`, { type: 'image/svg+xml' });
      }

      upsertLink('apple-touch-icon', iconUrl);
      manifestUrl = applyManifest({ name: storeName, shortName, iconUrl });
    };

    load();

    return () => {
      if (manifestUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(manifestUrl);
      }
    };
  }, []);

  return null;
}

export default AppBranding;
