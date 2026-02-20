FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server ./server

WORKDIR /app/server

EXPOSE 7777
CMD ["node", "index.js"]