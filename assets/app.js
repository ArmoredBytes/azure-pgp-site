(function () {
  const currentYearElement = document.getElementById('year');
  if (currentYearElement) {
    currentYearElement.textContent = String(new Date().getFullYear());
  }

  const tag = (window.AZURE_PGP_RELEASE_TAG || 'v1.0.0');
  const owner = 'ArmoredBytes';
  const repo = 'azure-pgp-site';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`;

  const listElem = document.getElementById('downloads-list');
  const fallbackElem = document.getElementById('downloads-fallback');

  function humanFileSize(bytes) {
    if (typeof bytes !== 'number') return '';
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + ' B';
    const units = ['KB','MB','GB','TB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  }

  async function loadAssets() {
    if (!listElem || !fallbackElem) { return; }
    try {
      const res = await fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github+json' } });
      if (!res.ok) throw new Error('Failed to load release info');
      const json = await res.json();
      if (!Array.isArray(json.assets)) throw new Error('No assets field');
      if (json.assets.length === 0) throw new Error('No assets in release');

      const fragment = document.createDocumentFragment();
      json.assets.forEach(function (asset) {
        const card = document.createElement('div');
        card.className = 'download-card';
        const link = document.createElement('a');
        link.href = asset.browser_download_url;
        link.textContent = asset.name;
        link.rel = 'noopener';
        link.target = '_blank';

        const meta = document.createElement('div');
        meta.className = 'meta';
        const size = humanFileSize(asset.size);
        const count = (typeof asset.download_count === 'number') ? asset.download_count + ' downloads' : '';
        meta.textContent = [size, count].filter(Boolean).join(' • ');

        card.appendChild(link);
        card.appendChild(meta);
        fragment.appendChild(card);
      });

      listElem.innerHTML = '';
      listElem.appendChild(fragment);
      fallbackElem.classList.add('hidden');
    } catch (e) {
      fallbackElem.classList.remove('hidden');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAssets);
  } else {
    loadAssets();
  }
})();


