FROM python:3.13.7

ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN groupadd --system tinyblog && useradd --system --gid tinyblog --home /app tinyblog

COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

COPY manage.py /app/manage.py
COPY posts /app/posts
COPY tinyblog /app/tinyblog

RUN chown -R tinyblog:tinyblog /app

USER tinyblog

EXPOSE 8000
CMD [ "gunicorn", "tinyblog.wsgi", "--workers", "3", "--bind", "0.0.0.0:8000" ]
