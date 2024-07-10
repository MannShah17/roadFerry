FROM node:14
# WORKDIR /E:/LogisticAdmin/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm insatll
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]