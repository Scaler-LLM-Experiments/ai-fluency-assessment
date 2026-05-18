FROM python:3.12-slim
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "python3 -m http.server ${PORT:-8080} --bind 0.0.0.0"]
