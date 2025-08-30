from django import forms

from .models import Post


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = [
            "title",
            "slug",
            "excerpt",
            "content",
            "status",
        ]
        widgets = {
            "title": forms.TextInput(
                attrs={
                    "class": "tb-input",
                    "placeholder": "Awesome post title",
                    "autofocus": True,
                }
            ),
            "slug": forms.TextInput(
                attrs={
                    "class": "tb-input",
                    "placeholder": "awesome-post-title",
                    "inputmode": "latin",
                }
            ),
            "excerpt": forms.Textarea(
                attrs={
                    "class": "tb-textarea",
                    "placeholder": "One or two sentences summarizing the post",
                    "rows": 3,
                }
            ),
            "content": forms.Textarea(
                attrs={
                    "class": "tb-textarea tb-monospace",
                    "placeholder": "Write your post in Markdown...",
                    "rows": 16,
                }
            ),
            "status": forms.Select(attrs={"class": "tb-select"}),
        }
