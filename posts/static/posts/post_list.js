(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    function current() {
      return document.documentElement.dataset.theme || 'light';
    }
    function label() {
      btn.textContent = current() === 'dark' ? '☀️' : '🌙';
    }
    btn.addEventListener('click', function () {
      const next = current() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
    });
    label();
  });
})();
