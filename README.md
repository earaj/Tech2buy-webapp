<h1>TECH2BUY</h1>

Pour déployer l'application, vous aurez besoin d'installer ces environnements suivants: **Docker Desktop**[^1], **Node.js**[^2] et **Visual Studio Code**[^3]. Assurez vous que le sous-système windows pour linux soit à jour pour assurer le bon fonctionnement de Docker Desktop. pour ce faire roulez cette commande dans l'invite de commande:<strong> wsl --update </strong>

Lorsque les environnements sont tous installés, veuillez commencer à suivre les étapes suivantes :
<h2>Installation du projet</h2> 

<h3>1- Cliquez sur "Download ZIP" pour télécharger le fichier ZIP de l'application web</h3>

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/6b7e25bb-588d-4761-8eba-355d816fa588)

<h3>2- Cliquez sur "Extraire tout..." pour décompresser l'archive ZIP</h3>

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/f6d67b9b-1f15-4a9e-aed1-28c01b332c74)







<h2>Configuration MySql :</h2> 

<h3>1- Dans le terminal, roulez cette commande: </h3>
docker run -d -p 3306:3306 --name mysql-server -e MYSQL_ROOT_PASSWORD=oracle -e MYSQL_DATABASE=scott -e MYSQL_USER=scott -e MYSQL_PASSWORD=oracle mysql/mysql-server:latest
<h3>2- Sur DockerDesktop, un nouveau conteneur nommé "mysql-server" sera créé. Lancez le conteneur et roulez dans le CLI du conteneur: </h3>
mysql -u root -p
mot de passe: oracle

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/97714714-b2dd-463a-936d-1a906552b834)
![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/bf6258b4-77b8-43f9-a9fd-5653b73f293f)


CREATE DATABASE mybd; USE mybd;
<h3>3- Rendez vous dans le dossier "Script", puis ouvrez le fichier "script2.sql". copiez le contenu du fichier et collez le dans le CLI du conteneur, puis, roulez le.</h3>

<h3>4- Toujours dans le dossier "Script", ouvrez le fichier "InsertionDonnees.sql". copiez le contenu du fichier et collez le dans le CLI du conteneur, puis, roulez le.</h3>

<h3>5- roulez ce script dans le terminal du conteneur pour ajouter l'utulisateur scott:</h3>
CREATE USER 'scott'@'%' IDENTIFIED WITH mysql_native_password BY 'oracle';
GRANT ALL PRIVILEGES ON *.* TO 'scott'@'%';
FLUSH PRIVILEGES;




<h2>Configuration MongoDB</h2>

<h3>5- Dans le terminale, roulez cette commande: docker run --name mongo -d -p 27017:27017 mongodb/mongodb-community-server:latest

<h3>6- Sur DockerDesktop, un nouveau conteneur nommé "mongo" sera créé. Lancez le conteneur

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/7f51e8c6-f42c-4843-ba2f-bda4d4647107)




<h2>Installation de package pour node.js</h2>

<h3>7- Allez dans l'invite de commande et tapez: cd Downloads/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj-main/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj-main/Projet</h3>

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/f743e3d7-56fc-485e-9da6-aa88697d37f4)

<h3>8- Dans ce repertoire, tapez ceci pour installer les paquets nécéssaire au fonctionnement de l'application:</h3>

npm install mysql2 bcrypt express paypal-rest-sdk dateformat mongodb nodemailer nodemailer-smtp-transport google-auth-library --save


<h2>Lancement de l'application</h2>

<h3>8- Toujours dans le même répertoire dans terminal, tapez:</h3>
node server.js
<h3>9- Allez dans un navigateur et tapez: </h3>
http://localhost:4000

<br>

[^1]: Lien pour installer Docker Desktop sur votre machine : https://docs.docker.com/get-docker/
[^2]: Lien pour installer Node.js sur votre machine : https://nodejs.org/en/download
[^3]: Lien pour installer l'éditeur Visual Studio Code : https://code.visualstudio.com/download

<br>

> [!TIP]
> Assurez d'avoir au moins 10GB stockage libre sur votre ordinateur afin d'installer tous les environnements requis.

