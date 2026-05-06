# Use Node.js 20 LTS as base
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Expose the port (Hugging Face uses 7860 by default for some spaces, but we can set it)
EXPOSE 7860

# Override PORT for the app to match HF's expectation
ENV PORT=7860

# Start the application
CMD ["npm", "start"]
