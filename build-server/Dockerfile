FROM ubuntu:focal 

RUN apt-get update
RUN apt-get install -y curl 

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - 
RUN apt-get install nodejs -y 
RUN apt-get upgrade -y

RUN apt-get install -y build-essential
RUN apt-get install -y git

WORKDIR /home/app 

COPY main.sh main.sh
COPY script.js script.js 
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install
RUN chmod +x main.sh 
RUN chmod +x script.js

ENTRYPOINT [ "/home/app/main.sh" ]