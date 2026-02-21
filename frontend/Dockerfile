# Stage 1: Base image
FROM node:22-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
# Copy package files first to leverage Docker layer cache
COPY package*.json ./
# Install dependencies, clean cache, and remove temporary files to save space
RUN npm install && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Stage 3: Development environment
FROM deps AS dev
# node_modules is already present from 'deps'
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 4: Production builder
FROM deps AS builder
COPY . .
# Run production build (e.g., Vite build)
RUN npm run build

# Stage 5: Production server
FROM nginx:alpine AS prod
# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Note: Add custom nginx configuration file here if necessary
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
