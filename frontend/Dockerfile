# Stage 1: Base (Dependencies)
FROM node:22-alpine AS base
WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./
RUN npm install

# Stage 2: Development
FROM base AS dev
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
