# Dockerfile für deine Alexa-Express-App
FROM node:18

# Arbeitsverzeichnis im Container
WORKDIR /app

# Dateien ins Image kopieren
COPY . .

# Abhängigkeiten installieren
RUN npm install

# App läuft auf Port 3000
EXPOSE 3000

# Startbefehl
CMD ["npm", "start"]
