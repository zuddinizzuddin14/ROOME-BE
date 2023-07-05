FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install -g npm
RUN npm install
RUN npm ci --omit=dev

COPY . .

CMD ["npm", "run", "start:prod", "&& nginx -g \"daemon off;\""]