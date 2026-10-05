# ==============================================================================
# Production Dockerfile for InterviewIQ React Frontend
# Multi-stage build: compiles React SPA assets, then serves with Nginx
# ==============================================================================

# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Default to /api for production reverse-proxy routing
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
