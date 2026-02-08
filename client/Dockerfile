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
#    ⟁  SYSTEM LAYER : FRONTEND DOCKER IMAGE
#    ⟁  PURPOSE      : Containerized frontend deployment
#
#                           ⟡  A I V A  ⟡
#
#                      © 2026 Mohitraj Jadeja
#
# ═══════════════════════════════════════════════════════════════════════════════

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Build argument for API URL
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
