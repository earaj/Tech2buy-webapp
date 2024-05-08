<h1>TECH2BUY</h1>

Pour déployer l'application, vous aurez besoin d'installer ces environnements suivants: **Docker Desktop**[^1], **Node.js**[^2] et **Visual Studio Code**[^3].

Lorsque les environnements sont tous installés, veuillez commencer à suivre les étapes suivantes :

<h3>Configuration MySql :</h1> 

1- Dans le terminal, roulez cette commande: docker run -d -p 3306:3306 --name mysql-server -e MYSQL_ROOT_PASSWORD=oracle -e MYSQL_DATABASE=scott -e MYSQL_USER=scott -e MYSQL_PASSWORD=oracle mysql/mysql-server:latest

2- Sur DockerDesktop, un nouveau conteneur nommé "mysql-server" sera créé. Lancez le conteneur et roulez dans le CLI du conteneur: CREATE DATABASE mybd; USE mybd;

3- Rendez vous dans le dossier "Script", puis ouvrez le fichier "script2.sql". copiez le contenu du fichier et collez le dans le CLI du conteneur, puis, roulez le.

4- Toujours dans le dossier "Script", ouvrez le fichier "InsertionDonnees.sql". copiez le contenu du fichier et collez le dans le CLI du conteneur, puis, roulez le.



<h3>Configuration MongoDB</h3>

5- Dans le terminale, roulez cette commande: docker run --name mongo -d -p 27017:27017 mongodb/mongodb-community-server:latest

6- Sur DockerDesktop, un nouveau conteneur nommé "mongo" sera créé. Lancez le conteneur


<h3>Installation de package pour node.js</h3>

7- Dans visual studio code, allez dans le terminal et roulez ceci dans ce dernier:

-npm install mysql2 bcrypt express paypal-rest-sdk dateformat mongodb nodemailer nodemailer-smtp-transport google-auth-library --save


<h3>Lancement de l'application</h3>

8- Dans visual studio code, allez dans le terminal et tapez: node server.js

9- Allez dans un navigateur et tapez: http://localhost:4000


[^1]: Lien pour installer Docker Desktop sur votre machine : https://docs.docker.com/get-docker/
[^2]: Lien pour installer Node.js sur votre machine : https://nodejs.org/en/download
[^3]: Lien pour installer l'éditeur Visual Studio Code : https://code.visualstudio.com/download

<br>

> [!TIP]
> Assurez d'avoir au moins 10GB stockage libre sur votre ordinateur afin d'installer tous les environnements requis.

