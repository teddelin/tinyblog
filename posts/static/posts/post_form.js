(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  const COMBINING_MARKS = /\p{M}/gu;

  function slugify(text) {
    try {
      const normalized = text.toString().toLowerCase().normalize('NFD');
      const withoutMarks = normalized.replaceAll(COMBINING_MARKS, '');

      let result = '';
      let pendingHyphen = false;

      for (const char of withoutMarks) {
        const isDigit = char >= '0' && char <= '9';
        const isLowerAlpha = char >= 'a' && char <= 'z';
        if (isDigit || isLowerAlpha) {
          if (pendingHyphen && result.length > 0) {
            result += '-';
          }
          result += char;
          pendingHyphen = false;
        } else if (result.length > 0) {
          pendingHyphen = true;
        }
      }

      return result;
    } catch (e) {
      return text;
    }
  }

  ready(function () {
    // Auto-slug from title until user edits slug
    const title = document.getElementById('id_title');
    const slug = document.getElementById('id_slug');
    if (title && slug) {
      let slugDirty = false;
      slug.addEventListener('input', function () { slugDirty = slug.value.trim().length > 0; });
      title.addEventListener('input', function () { if (!slugDirty) slug.value = slugify(title.value); });
    }

    // Markdown editor + server-rendered preview
    const el = document.getElementById('id_content');
    const preview = document.getElementById('md-preview');
    if (!el || !preview || typeof EasyMDE === 'undefined') return;

    const editor = new EasyMDE({
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
      const inputEl = editor.codemirror.getInputField();
      if (inputEl) {
        inputEl.setAttribute('spellcheck', 'true');
        inputEl.setAttribute('lang', 'en');
      }
    } catch (e) { /* noop */ }

    const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    const csrfToken = csrfInput ? csrfInput.value : null;
    const url = preview.dataset.previewUrl;
    let t = null;
    function renderPreview() {
      clearTimeout(t);
      t = setTimeout(function () {
        const content = editor.value();
        if (window.htmx && url) {
          window.htmx.ajax('POST', url, {
            target: '#md-preview',
            values: { content: content },
            headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {}
          });
        } else {
          try {
            const html = EasyMDE.prototype.markdown(content);
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
