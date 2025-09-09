# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (copy package.json first for caching)
COPY package.json package-lock.json* ./

# Use npm ci when lockfile exists, fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Use a non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Default command (use `npm run dev` in local dev via mounted volume if desired)
CMD ["npm", "start"]