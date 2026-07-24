FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
