# Build stage
FROM node:19-alpine as build-stage

WORKDIR /home/node/app
COPY ./frontend .
RUN ["npm", "install"]
RUN ["npm", "run", "build"]

# Serving stage
FROM nginx:1.23.4-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /home/node/app/dist /frontend
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]