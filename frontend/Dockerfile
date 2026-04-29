# Stage 1 — Build the app
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (include devDependencies here!)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:1.23-alpine AS production
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 90
CMD ["nginx", "-g", "daemon off;"]
