# ---- Stage 1: Build ----
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY public ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY . .

RUN npm run build

# ---- Stage 2: Run ----
# FROM node:20-slim

# # Create app directory
# WORKDIR /app

# RUN npm install vite
# # Copy only the build output and dependencies
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/version.json ./
# COPY --from=builder /app/vite.config.ts ./

# RUN npm install --force

# ENV NODE_ENV=production

# # Expose your app's port


# # Start the app
# CMD ["npm","run", "preview"]

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

