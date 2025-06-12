document.body.addEventListener('click', () => {
  chrome.tabs.create({ url: 'logs.html' });
  window.close();
});
