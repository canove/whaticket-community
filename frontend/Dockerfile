FROM node:14-alpine as build-deps
WORKDIR /app
COPY /public /app/public
COPY /src /app/src
COPY package.json /app/package.json

COPY .env* ./

RUN npm install -g 
RUN npm install react-scripts@4.0.3 --silent
RUN react-scripts build

FROM nginx:alpine
COPY --from=build-deps /app/build /usr/share/nginx/html
EXPOSE 80