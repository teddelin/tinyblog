(function () {
  try {
    const t = localStorage.getItem('theme') || 'dark';
    document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
