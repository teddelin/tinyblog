from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Post(models.Model):
    DRAFT = "draft"
    PUBLISHED = "published"

    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (PUBLISHED, "Published"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts"
    )
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=DRAFT)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["status", "published_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(status="published") | Q(published_at__isnull=True),
                name="published_at_null_unless_published",
            )
        ]

    def __str__(self) -> str:  # pragma: no cover
        return self.title

    @property
    def is_published(self) -> bool:
        if self.status != self.PUBLISHED:
            return False
        if self.published_at is None:
            return False
        return self.published_at <= timezone.now()

    def save(self, *args, **kwargs):
        # Ensure published_at is only set when status is published
        if self.status == self.PUBLISHED:
            if self.published_at is None:
                self.published_at = timezone.now()
        else:
            # Clear published_at for non-published statuses
            self.published_at = None

        super().save(*args, **kwargs)
