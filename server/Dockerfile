# ═══════════════════════════════════════════════════════════════════════════════
#
#         █████╗ ██╗██╗   ██╗ █████╗
#        ██╔══██╗██║██║   ██║██╔══██╗
#        ███████║██║██║   ██║███████║
#        ██╔══██║██║╚██╗ ██╔╝██╔══██║
#        ██║  ██║██║ ╚████╔╝ ██║  ██║
#        ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝
#
#    ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──
#
#    ◉  Deterministic Execution System
#    ◉  Rule-Bound • State-Aware • Non-Emotive
#
#    ⟁  SYSTEM LAYER : BACKEND DOCKER IMAGE
#    ⟁  PURPOSE      : Containerized backend deployment
#
#                           ⟡  A I V A  ⟡
#
#                      © 2026 Mohitraj Jadeja
#
# ═══════════════════════════════════════════════════════════════════════════════

# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs config

# Set environment variables (defaults, will be overridden by docker-compose)
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "index.js"]
