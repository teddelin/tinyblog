from django import template
from django.utils.safestring import mark_safe

try:
    import markdown as md
except Exception:  # pragma: no cover
    md = None


register = template.Library()


@register.filter(name="markdown")
def markdown_filter(value: str) -> str:
    """Render Markdown text to HTML.

    Note: Assumes content is trusted. If you accept untrusted input,
    add HTML sanitization (e.g., bleach) before mark_safe.
    """
    if value is None:
        return ""
    if md is None:
        # Fallback: return as-is with simple line breaks
        return mark_safe("<p>" + str(value).replace("\n", "<br />\n") + "</p>")
    html = md.markdown(
        str(value),
        extensions=[
            "extra",  # tables, code blocks, etc.
            "sane_lists",
            "nl2br",
        ],
        output_format="html5",
    )
    return mark_safe(html)

