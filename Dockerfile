# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# forza installazione pulita
RUN rm -rf node_modules package-lock.json && npm install
COPY . .
RUN npm run build

# --- runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN rm -rf node_modules package-lock.json && npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
# Serve static build with 'serve'
CMD [ "sh", "-lc", "npx serve -s dist -l ${PORT:-3000}" ]
