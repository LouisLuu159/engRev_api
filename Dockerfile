# Base image
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Both package.json AND package-lock.json are copied
COPY package.json ./ 
COPY yarn.lock ./

# Install app dependencies
RUN yarn install --silent


# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build

# Start the server using the production build
CMD [ "yarn", "start:dev" ]

