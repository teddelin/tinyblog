from django.db import migrations


def clear_published_at_for_drafts(apps, schema_editor):
    Post = apps.get_model('posts', 'Post')
    Post.objects.exclude(status='published').update(published_at=None)


class Migration(migrations.Migration):
    dependencies = [
        ('posts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(clear_published_at_for_drafts, migrations.RunPython.noop),
    ]
