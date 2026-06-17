import { useEffect } from 'react';
import { getStoreSettings } from '../services/api';
import { applyStoreBranding } from '../utils/appBranding';

function AppBranding() {
  useEffect(() => {
    let manifestUrl;

    const load = async () => {
      const settings = await getStoreSettings();
      if (settings) {
        manifestUrl = applyStoreBranding(settings);
      }
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
