FROM node:12.18.1-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./src/package*.json ./

# Install bcrypt
# from https://www.richardkotze.com/top-tips/install-bcrypt-docker-image-exclude-host-node-modules
RUN apk add --no-cache make gcc g++ python && \
  npm install && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python

RUN npm install nodemon -g
# If you are building your code for production
# RUN npm ci --only=production
