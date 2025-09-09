from django.test import TestCase
from django.contrib.auth import get_user_model

from posts.forms import PostForm
from posts.models import Post


class PostFormPublishedAtTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="author1", email="a@example.com", password="pass1234"
        )

    def test_draft_does_not_set_published_at(self):
        form = PostForm(
            data={
                "title": "Draft post",
                "slug": "draft-post",
                "excerpt": "",
                "content": "Draft content",
                "status": Post.DRAFT,
            }
        )
        self.assertTrue(form.is_valid(), form.errors)
        post = form.save(commit=False)
        post.author = self.user
        post.save()

        self.assertEqual(post.status, Post.DRAFT)
        self.assertIsNone(post.published_at)
        self.assertFalse(post.is_published)

    def test_published_sets_published_at(self):
        form = PostForm(
            data={
                "title": "Published post",
                "slug": "published-post",
                "excerpt": "",
                "content": "Published content",
                "status": Post.PUBLISHED,
            }
        )
        self.assertTrue(form.is_valid(), form.errors)
        post = form.save(commit=False)
        post.author = self.user
        post.save()

        self.assertEqual(post.status, Post.PUBLISHED)
        self.assertIsNotNone(post.published_at)
        self.assertTrue(post.is_published)

