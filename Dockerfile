FROM node:14-alpine

# Install Doppler
RUN (curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh || wget -t 3 -qO- https://cli.doppler.com/install.sh) | sh
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