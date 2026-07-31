# Stage 1: Build the React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python Flask Backend
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn eventlet

# Copy backend application
COPY backend/ ./backend

# Copy built frontend assets to the static directory Flask expects
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set Environment Variables
ENV FLASK_APP=backend/app.py
ENV PORT=5000

EXPOSE 5000

# Start Backend using Gunicorn with Eventlet (required for Flask-SocketIO websockets)
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "-b", "0.0.0.0:5000", "backend.app:create_app()"]
