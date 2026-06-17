import { API_BASE_URL, getImageUrl } from '../services/api';

const THEME_COLOR = '#0c1f3d';
const FALLBACK_ICON = '/logo512.png';

function upsertMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

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

export function buildShortName(storeName) {
  const name = storeName?.trim() || 'Shop';
  return name.length > 12 ? name.slice(0, 12).trim() : name;
}

export function applyStoreBranding(settings) {
  const origin = window.location.origin;
  const storeName = settings?.storeName?.trim() || 'Shop';
  const shortName = buildShortName(storeName);
  const storeLogo = settings?.storeLogo ? getImageUrl(settings.storeLogo) : null;
  const iconUrl = storeLogo || `${origin}${FALLBACK_ICON}`;

  document.documentElement.dataset.siteName = storeName;
  document.title = storeName;

  upsertMeta('apple-mobile-web-app-title', shortName);
  upsertMeta('application-name', shortName);

  if (storeLogo) {
    upsertLink('icon', storeLogo, { type: 'image/png' });
  } else {
    upsertLink('icon', `${origin}/icon.svg`, { type: 'image/svg+xml' });
  }

  upsertLink('apple-touch-icon', iconUrl);

  const manifest = {
    short_name: shortName,
    name: storeName,
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
  const manifestUrl = URL.createObjectURL(blob);
  upsertLink('manifest', manifestUrl);

  return manifestUrl;
}

export async function loadAndApplyStoreBranding() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/store/settings`);
    if (!response.ok) return null;
    const settings = await response.json();
    return applyStoreBranding(settings);
  } catch (error) {
    console.error('Error loading store branding:', error);
    return null;
  }
}
