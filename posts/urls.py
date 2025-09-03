from django.urls import path

from .views import (
    PostListView,
    PostDetailView,
    PostCreateView,
    PostSearchView,
    PostUpdateView,
    markdown_preview,
)

urlpatterns = [
    path("", PostListView.as_view(), name="post-list"),
    path("search/", PostSearchView.as_view(), name="post-search"),
    path("preview/markdown/", markdown_preview, name="markdown-preview"),
    path("new/", PostCreateView.as_view(), name="post-create"),
    path("<slug:slug>/edit/", PostUpdateView.as_view(), name="post-edit"),
    path("<slug:slug>/", PostDetailView.as_view(), name="post-detail"),
]
