# download the base image of server
FROM nginx:stable

#create a wroking directory where code is store 
WORKDIR /app

#copy all code form local working directory 
COPY . .

#copy code form the host machine to nginx server
COPY . /usr/share/nginx/html

#port number where aplication run
EXPOSE 5000

#execute the system
CMD ["nginx" , "-g" , "daemon off;"]
