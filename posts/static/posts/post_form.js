(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function slugify(text) {
    try {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    } catch (e) {
      return text;
    }
  }

  ready(function () {
    // Auto-slug from title until user edits slug
    var title = document.getElementById('id_title');
    var slug = document.getElementById('id_slug');
    if (title && slug) {
      var slugDirty = false;
      slug.addEventListener('input', function () { slugDirty = slug.value.trim().length > 0; });
      title.addEventListener('input', function () { if (!slugDirty) slug.value = slugify(title.value); });
    }

    // Markdown editor + server-rendered preview
    var el = document.getElementById('id_content');
    var preview = document.getElementById('md-preview');
    if (!el || !preview || typeof EasyMDE === 'undefined') return;

    var editor = new EasyMDE({
      element: el,
      autofocus: false,
      autosave: { enabled: true, uniqueId: 'tinyblog-post-content', delay: 1000 },
      // Use the browser's native spellchecker via contentEditable for English
      spellChecker: false,
      status: false,
      placeholder: 'Write your post in Markdown...',
      forceSync: true,
      codemirror: { inputStyle: 'contenteditable' },
      renderingConfig: { codeSyntaxHighlighting: true },
      toolbar: [
        'bold','italic','strikethrough','heading','|',
        'quote','unordered-list','ordered-list','table','|',
        'link','image','code','|',
        'preview','side-by-side','fullscreen','|',
        'guide'
      ]
    });

    // Ensure spellcheck/lang attributes are set on the editable element
    try {
      var inputEl = editor.codemirror.getInputField();
      if (inputEl) {
        inputEl.setAttribute('spellcheck', 'true');
        inputEl.setAttribute('lang', 'en');
      }
    } catch (e) { /* noop */ }

    var csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    var csrfToken = csrfInput ? csrfInput.value : null;
    var url = preview.dataset.previewUrl;
    var t = null;
    function renderPreview() {
      clearTimeout(t);
      t = setTimeout(function () {
        var content = editor.value();
        if (window.htmx && url) {
          window.htmx.ajax('POST', url, {
            target: '#md-preview',
            values: { content: content },
            headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {}
          });
        } else {
          try {
            var html = EasyMDE.prototype.markdown(content);
            preview.innerHTML = html;
          } catch (e) {
            preview.textContent = content;
          }
        }
      }, 200);
    }

    editor.codemirror.on('change', renderPreview);
    renderPreview();
  });
})();
