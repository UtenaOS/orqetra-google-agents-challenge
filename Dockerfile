FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
COPY samples ./samples
COPY docs ./docs

ENV NODE_ENV=production
ENV PORT=8080
ENV ORQETRA_DEMO_MODE=challenge

EXPOSE 8080

CMD ["node", "src/demo-server.mjs"]
