import React, { useEffect, useState } from 'react';
import { waitForApiHealth } from '../services/apiHealth';
import './ApiStatusGate.css';

function ApiStatusGate({ children }) {
  const [ready, setReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let overlayTimer;

    const check = async () => {
      setReady(false);
      setFailed(false);
      setShowOverlay(false);

      overlayTimer = setTimeout(() => {
        if (!cancelled) setShowOverlay(true);
      }, 1500);

      const isHealthy = await waitForApiHealth();
      clearTimeout(overlayTimer);

      if (cancelled) return;

      if (isHealthy) {
        setReady(true);
        setShowOverlay(false);
      } else {
        setFailed(true);
        setShowOverlay(true);
      }
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(overlayTimer);
    };
  }, [retryKey]);

  if (ready && !showOverlay) {
    return children;
  }

  return (
    <>
      {showOverlay && (
        <div className="api-wake-overlay">
          <div className="api-wake-card">
            <div className="api-wake-spinner" />
            <h2>{failed ? 'Server is still starting' : 'Starting the server'}</h2>
            <p>
              {failed
                ? 'The free hosting plan can take up to a minute to wake up. Please try again.'
                : 'Please wait a moment. This usually takes 30–60 seconds after inactivity.'}
            </p>
            {failed && (
              <button type="button" className="api-wake-retry" onClick={() => setRetryKey((k) => k + 1)}>
                Try again
              </button>
            )}
          </div>
        </div>
      )}
      {ready ? children : null}
    </>
  );
}

export default ApiStatusGate;
