FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy application source
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "src/server.js"]
