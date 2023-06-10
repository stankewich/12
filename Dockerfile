FROM node:16
ENV NODE_ENV=test \
    PORT=80
WORKDIR /app
COPY ./ ./
RUN npm ci --only=production
RUN npm -w frontend run build
EXPOSE 80
CMD npx -w backend sequelize-cli db:create; npm run start -w backend