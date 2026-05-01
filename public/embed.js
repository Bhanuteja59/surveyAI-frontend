(function() {
  const script = document.currentScript;
  const token = script.getAttribute('data-survey-token');
  const containerId = script.getAttribute('data-container');
  const width = script.getAttribute('data-width') || '100%';
  const height = script.getAttribute('data-height') || '600px';
  const baseUrl = window.location.origin;

  if (!token) {
    console.error('Lumino Embed: Missing data-survey-token attribute.');
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.src = `${baseUrl}/s/${token}?embed=true`;
  iframe.style.width = width;
  iframe.style.height = height;
  iframe.style.border = 'none';
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('frameborder', '0');

  if (containerId) {
    const target = document.getElementById(containerId);
    if (target) {
      target.appendChild(iframe);
    } else {
      console.error(`Lumino Embed: Container #${containerId} not found.`);
    }
  } else {
    script.parentNode.insertBefore(iframe, script.nextSibling);
  }
})();
