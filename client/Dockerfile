FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf.template /etc/nginx/conf.d/default.conf.template

CMD envsubst '${BACKEND_HOST} ${BACKEND_PORT}' \
    < /etc/nginx/conf.d/default.conf.template \
     > /etc/nginx/conf.d/default.conf &&\
      exec nginx -g 'daemon off;'