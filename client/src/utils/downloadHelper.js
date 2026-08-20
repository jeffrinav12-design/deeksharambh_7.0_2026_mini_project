export async function downloadFile(url, fallbackFilename) {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const fullUrl = url.includes('?') ? `${url}&token=${token}` : `${url}?token=${token}`;
    
    const response = await fetch(fullUrl, { headers });
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `Server returned status ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const rawBlob = await response.blob();
    const blob = new Blob([rawBlob], { type: contentType });

    const contentDisposition = response.headers.get('content-disposition');
    let filename = fallbackFilename;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;'"\n]+)['"]?/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].replace(/^["']|["']$/g, ''));
      }
    }
    
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
  } catch (err) {
    console.error("Direct fetch download failed, falling back to window.open:", err);
    const token = localStorage.getItem('token');
    const fullUrl = url.includes('?') ? `${url}&token=${token}` : `${url}?token=${token}`;
    window.open(fullUrl, '_blank');
  }
}
