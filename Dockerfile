FROM node:8-alpine

# ENV vars 
ARG GITHUB_CALLBACK 
ARG GITHUB_ID 
ARG GITHUB_SECRET 
 
ENV GITHUB_CALLBACK ${GITHUB_CALLBACK} 
ENV GITHUB_ID ${GITHUB_ID} 
ENV GITHUB_SECRET ${GITHUB_SECRET} 

# Create app directory
RUN mkdir -p /usr/src/micro-auth
WORKDIR /usr/src/micro-auth

# Install app dependencies
COPY ./package.json /usr/src/micro-auth/
COPY ./package-lock.json /usr/src/micro-auth/
RUN npm install

# Bundle app source
COPY . /usr/src/micro-auth

EXPOSE 3000

CMD [ "npm", "start" ]
