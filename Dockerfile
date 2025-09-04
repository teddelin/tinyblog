FROM python:3.13.7

ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
EXPOSE 8000
CMD [ "gunicorn", "tinyblog.wsgi", "--workers", "3", "--bind", "0.0.0.0:8000" ]