TinyBlog
========

A minimal Django blog app with Markdown authoring, live markdown preview.


Quickstart
----------

Commands (run from the repo root):

```
# Create and activate a venv (optional)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Migrate database
python manage.py makemigrations posts
python manage.py migrate

# Create a superuser (to log in / admin)
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata posts/fixtures/sample_posts.json

# Run the dev server
python manage.py runserver
```

License
-------

See `LICENSE`.
