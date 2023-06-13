FROM node:14-alpine as build-deps
WORKDIR /app
COPY /public /app/public
COPY /src /app/src
COPY package.json /app/package.json

#COPY .env* ./

ENV GENERATE_SOURCEMAP=false

RUN npm install --legacy-peer-deps
RUN npm install react-scripts@3.3.1 -g
RUN react-scripts --max_old_space_size=4096 build

ENV REACT_APP_BACKEND_URL =$REACT_APP_BACKEND_URL
ENV REACT_APP_WORKER_URL =$REACT_APP_WORKER_URL
ENV REACT_APP_SQS_URL =$REACT_APP_SQS_URL
#RUN echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL" >> ./.env
#RUN echo "REACT_APP_WORKER_URL=$REACT_APP_WORKER_URL" >> ./.env
#RUN echo "REACT_APP_SQS_URL=$REACT_APP_SQS_URL" >> ./.env


FROM nginx:alpine
COPY .docker/nginx /etc/nginx/

COPY --from=build-deps /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80

#COPY .docker/add-env-vars.sh /docker-entrypoint.d/01-add-env-vars.sh
#RUN chmod +x /docker-entrypoint.d/01-add-env-vars.sh