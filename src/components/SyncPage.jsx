import React, { useState } from 'react';

const SyncPage = () => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      if (data.success) {
        setResult("Sync completed successfully! The catalogue is updated.");
      } else {
        setError(data.error || "An error occurred during sync.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="sync-page slide-in-right">
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
        <h2>Live Sync with Google Sheets</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Click the button below to download the latest product updates from your Google Sheet.
          This will update prices, add new items, and attempt to fetch images for any new products.
        </p>
        
        <button 
          onClick={handleSync} 
          disabled={syncing}
          className="btn-add pulse"
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          {syncing ? "Syncing... This may take a minute ⏳" : "Sync Data Now 🔄"}
        </button>

        {result && (
          <div style={{ marginTop: '2rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
            ✅ {result}
            <br />
            <a href="/" style={{ color: 'white', display: 'inline-block', marginTop: '1rem', textDecoration: 'underline' }}>Return to Store</a>
          </div>
        )}
        
        {error && (
          <div style={{ marginTop: '2rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncPage;
