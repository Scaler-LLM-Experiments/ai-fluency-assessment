FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["serve", "-s", ".", "-l", "3000"]
