# Use a specific, minimal Alpine-based Node.js image
FROM node:18-alpine

# Set production environment
ENV NODE_ENV=production

# Create a non-privileged user
RUN addgroup -S ctfgroup && adduser -S ctfuser -G ctfgroup

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Ensure the app can write to progress.json but is owned by root otherwise
# We create an empty progress.json if it doesn't exist
RUN touch progress.json && \
    chown ctfuser:ctfgroup progress.json && \
    mkdir -p public && \
    chown -R root:root /app && \
    chown ctfuser:ctfgroup /app/progress.json

# Switch to the non-root user
USER ctfuser

# Expose the application port
EXPOSE 1439

# Run the application
CMD ["node", "app.js"]
