(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function slugify(text) {
    try {
      const normalized = text.toString().toLowerCase().normalize('NFD');
      let result = '';
      let prevHyphen = false;

      for (const char of normalized) {
        const code = char.codePointAt(0);
        const isCombining =
          (code >= 0x0300 && code <= 0x036f) || // Combining Diacritical Marks
          (code >= 0x1ab0 && code <= 0x1aff) || // Combining Diacritical Marks Extended
          (code >= 0x1dc0 && code <= 0x1dff) || // Combining Diacritical Marks Supplement
          (code >= 0x20d0 && code <= 0x20ff) || // Combining Diacritical Marks for Symbols
          (code >= 0xfe20 && code <= 0xfe2f);   // Combining Half Marks
        if (isCombining) continue;

        const isAlphanumeric =
          (code >= 0x30 && code <= 0x39) || // 0-9
          (code >= 0x61 && code <= 0x7a);   // a-z
        if (isAlphanumeric) {
          result += char;
          prevHyphen = false;
          continue;
        }

        if (char === ' ' || char === '_' || char === '-') {
          if (!prevHyphen && result.length > 0) {
            result += '-';
            prevHyphen = true;
          }
        }
      }

      while (result.endsWith('-')) {
        result = result.slice(0, -1);
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
