# Use a Node.js 20 base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the client and server applications
RUN npm run build

# Expose the port the app runs on (as defined in docker-compose.yml)
EXPOSE 5000

# Command to run the application
CMD [ "npm", "start" ]
