Pour déployer l'application, vous aurez besoin de Docker Desktop, Node.js et Visual Studio Code.

==Configuration MySql==
1- Dans le terminale, roulez cette commande: docker run -d -p 3306:3306 --name mysql-server -e MYSQL_ROOT_PASSWORD=oracle -e MYSQL_DATABASE=scott -e MYSQL_USER=scott -e MYSQL_PASSWORD=oracle mysql/mysql-server:latest
2- Sur DockerDesktop, un nouveau conteneur nommé "mysql-server" sera créé. Lancez le conteneur et roulez dans le CLI du conteneur: CREATE DATABASE mybd; USE mybd;
3- Rendez vous dans le dossier "Script", puis ouvrez le fichier "script2.sql". copiez le contenu du fichier et collez le dans le CLI du conteneur, puis, roulez le.
4- Toujours dans le dossier "Script", ouvrez le fichier "InsertionDonnees.sql". copiez le contenu du fichier et collez le dans le CLI du conteneur, puis, roulez le.


==Configuration MongoDB==
5- Dans le terminale, roulez cette commande: docker run --name mongo -d -p 27017:27017 mongodb/mongodb-community-server:latest
6- Sur DockerDesktop, un nouveau conteneur nommé "mongo" sera créé. Lancez le conteneur


==Installation de package pour node.js==
7- Dans visual studio code, allez dans le terminal et roulez ceci dans ce dernier:
-npm install mysql2 bcrypt express paypal-rest-sdk dateformat mongodb nodemailer --save


==lancement de l'application==
8- Dans visual studio code, allez dans le terminal et tapez: node server.js
9- allez dans un navigateur et tapez: http://localhost:4000

