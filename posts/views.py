from django.http import HttpResponse
from django.utils import timezone
from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator

from .models import Post
from .forms import PostForm


class PostListView(ListView):
    model = Post
    template_name = "posts/post_list.html"
    context_object_name = "posts"
    paginate_by = 20

    def get_queryset(self):
        from django.db.models import Q

        base_q = Q(status=Post.PUBLISHED, published_at__lte=timezone.now())
        if self.request.user.is_authenticated:
            # Include this user's drafts in the list
            base_q = base_q | Q(author=self.request.user, status=Post.DRAFT)

        return (
            Post.objects.filter(base_q)
            .select_related("author")
            .order_by("-published_at", "-created_at")
        )


class PostDetailView(DetailView):
    model = Post
    template_name = "posts/post_detail.html"
    context_object_name = "post"
    slug_field = "slug"
    slug_url_kwarg = "slug"

    def get_queryset(self):
        from django.db.models import Q

        base_q = Q(status=Post.PUBLISHED, published_at__lte=timezone.now())
        if self.request.user.is_authenticated:
            # Allow authors to view their own drafts
            base_q = base_q | Q(author=self.request.user)

        return Post.objects.filter(base_q).select_related("author")


class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    form_class = PostForm
    template_name = "posts/post_form.html"

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        return reverse("post-detail", kwargs={"slug": self.object.slug})


class PostSearchView(ListView):
    model = Post
    template_name = "posts/_post_list_items.html"
    context_object_name = "posts"

    def get_queryset(self):
        from django.db.models import Q

        base_q = Q(status=Post.PUBLISHED, published_at__lte=timezone.now())
        if self.request.user.is_authenticated:
            # Include this user's drafts in search results
            base_q = base_q | Q(author=self.request.user, status=Post.DRAFT)

        qs = Post.objects.filter(base_q).select_related("author")
        q = self.request.GET.get("q", "").strip()
        if q:
            from django.db.models import Q

            qs = qs.filter(
                Q(title__icontains=q)
                | Q(excerpt__icontains=q)
                | Q(content__icontains=q)
                | Q(author__username__icontains=q)
            )
        return qs.order_by("-published_at", "-created_at")[:50]


@require_POST
def markdown_preview(request):
    try:
        import markdown as md
    except Exception:
        return HttpResponse("", content_type="text/html")

    text = request.POST.get("content", "")
    html = md.markdown(
        str(text),
        extensions=["extra", "sane_lists", "nl2br"],
        output_format="html5",
    )
    return HttpResponse(html, content_type="text/html")


class PostUpdateView(LoginRequiredMixin, UpdateView):
    model = Post
    form_class = PostForm
    template_name = "posts/post_form.html"
    slug_field = "slug"
    slug_url_kwarg = "slug"

    def get_queryset(self):
        # Only allow authors to edit their own drafts via this form
        return Post.objects.filter(author=self.request.user, status=Post.DRAFT)

    def get_success_url(self):
        return reverse("post-detail", kwargs={"slug": self.object.slug})
