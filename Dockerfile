FROM node:11-stretch

RUN apt-get update -y
RUN apt-get install cmake -y

# Copy package.json file to docker image.
COPY package.json /app/
COPY package-lock.json /app/
COPY config.json /app/

# Define working directory.
WORKDIR /app

RUN npm install --production

COPY ./lib /app/lib
COPY ./site /app/site
COPY ./index.js /app/

RUN mkdir -p /app/images

CMD node index.js

EXPOSE 5656