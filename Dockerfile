FROM node:14-alpine

# Install Doppler
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Setup app directory
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .

RUN npm run build
ENTRYPOINT ["doppler", "run", "--"]

EXPOSE 3000
CMD ["node", "."]