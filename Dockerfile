# Use a lightweight Nginx image to serve static files
FROM nginx:alpine

# Copy the static website files to the default Nginx public folder
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
