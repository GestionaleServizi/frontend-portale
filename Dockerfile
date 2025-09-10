# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app

# Copia i file di definizione delle dipendenze
COPY package*.json ./

# ⚡ Forza installazione pulita e mostra versione Chakra
RUN rm -rf node_modules && npm cache clean --force && npm install && npm ls @chakra-ui/react

# Copia il resto del codice
COPY . .

# Compila l'app
RUN npm run build

# --- runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copia solo i pacchetti necessari
COPY --from=build /app/package*.json ./
RUN rm -rf node_modules && npm cache clean --force && npm install --omit=dev && npm ls @chakra-ui/react

# Copia i file buildati
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Serve static build con 'serve'
CMD [ "sh", "-lc", "npx serve -s dist -l ${PORT:-3000}" ]
