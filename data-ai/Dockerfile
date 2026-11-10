# ByteGuardian AI service — build from the REPO ROOT (it reads data/questions.json, data/scoring.json
# and data/synthetic/companies.csv):
#   docker build -f data-ai/Dockerfile -t byteguardian-ai .
# On Railway: second service from this repo, variable RAILWAY_DOCKERFILE_PATH=data-ai/Dockerfile.
FROM python:3.12-slim

WORKDIR /app
COPY data-ai/requirements.txt data-ai/requirements.txt
RUN pip install --no-cache-dir -r data-ai/requirements.txt

COPY data-ai data-ai
COPY data/questions.json data/scoring.json data/
COPY data/synthetic/companies.csv data/synthetic/companies.csv

ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app:app --app-dir data-ai/service --host 0.0.0.0 --port ${PORT}"]
