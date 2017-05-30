FROM node:7.10

RUN npm install yarn

# ENV vars
ENV GITHUB_CALLBACK ${GITHUB_CALLBACK}
ENV GITHUB_ID ${GITHUB_ID}
ENV GITHUB_SECRET ${GITHUB_SECRET}

# Create app directory
RUN mkdir -p /usr/src/micro-auth
WORKDIR /usr/src/micro-auth

# Install app dependencies
COPY ./package.json /usr/src/micro-auth/
RUN yarn install

# Bundle app source
COPY . /usr/src/micro-auth

EXPOSE 3000

CMD [ "yarn", "start" ]
