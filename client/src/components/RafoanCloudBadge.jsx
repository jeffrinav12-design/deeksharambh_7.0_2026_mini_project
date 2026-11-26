import React from 'react';

export default function RafoanCloudBadge({
  rafoanUrl = 'https://hakgrosuzhavanprojectfarmersnov2026-xmxy2zubbslwqjlj49o73b.streamlit.app/',
  tenantName = 'Rafoan Cloud',
}) {
  return (
    <a
      href={rafoanUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`Connected to ${tenantName} Multi-Cloud PaaS (AWS + Azure)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '9999px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 600,
        textDecoration: 'none',
        border: '1px solid rgba(96, 165, 250, 0.4)',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
      }}
    >
      <span>⚡ POWERED BY RAFOAN CLOUD</span>
    </a>
  );
}
