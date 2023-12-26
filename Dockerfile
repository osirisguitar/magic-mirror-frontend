FROM --platform=linux/amd64 node:18

#RUN apt-get update -y
#RUN apt-get install cmake -y

# Copy package.json file to docker image.
COPY package.json /app/
COPY package-lock.json /app/

# Define working directory.
WORKDIR /app

RUN npm install --production

COPY ./lib /app/lib
COPY ./site /app/site
COPY ./model /app/model
COPY ./index.js /app/

RUN mkdir -p /app/images

CMD node index.js

EXPOSE 5656