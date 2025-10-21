# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build


# ---------- Stage 2: Nginx Server ----------
FROM nginx:1.27-alpine

# Copy built files from previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config to serve on port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
