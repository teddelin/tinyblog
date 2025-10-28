(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    function current() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    }
    function label() {
      btn.textContent = current() === 'dark' ? '☀️' : '🌙';
    }
    btn.addEventListener('click', function () {
      const next = current() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
    });
    label();
  });
})();
