FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update

RUN npm install

RUN apt-get install default-jdk -y



COPY . .

EXPOSE 3000


CMD [ "npm", "run", "dev" ]
