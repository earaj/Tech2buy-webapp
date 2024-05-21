<h1>TECH2BUY</h1>

Pour déployer l'application, vous aurez besoin d'installer ces environnements suivants: **Docker Desktop**[^1], **Node.js**[^2] et **Visual Studio Code**[^3]. Assurez vous que le sous-système windows pour linux soit à jour pour assurer le bon fonctionnement de Docker Desktop. Pour ce faire, roulez cette commande dans l'invite de commande:<strong> wsl --update </strong>

Lorsque tous les environnements sont installés, veuillez commencer à suivre les étapes suivantes :
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

<h3>3- Une fois sur mySql roulez cette commande: </h3>
CREATE DATABASE mybd; USE mybd;

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/82d8ee8f-22ce-41db-ad44-a66cba81885a)


<h3>3- Rendez vous dans le dossier "Script", puis ouvrez le fichier "script.sql". copiez le contenu du fichier et collez le dans le CLI du conteneur, puis, roulez le.</h3>

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/40d4b4aa-a77b-470f-a5bc-8a2ce8f386dc)
![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/8e66b81b-936d-42dc-a389-3f575c9ac8da)


<h3>4- Toujours dans le dossier "Script", ouvrez le fichier "InsertionDonnees.sql". copiez le contenu du fichier et collez le dans le CLI du conteneur, puis, roulez le.</h3>

<h3>5- Roulez ce script dans le terminal du conteneur pour ajouter l'utulisateur scott:</h3>
CREATE USER 'scott'@'%' IDENTIFIED WITH mysql_native_password BY 'oracle';
GRANT ALL PRIVILEGES ON *.* TO 'scott'@'%';
FLUSH PRIVILEGES;




<h2>Configuration MongoDB</h2>

<h3>5- Dans le terminal, roulez cette commande: docker run --name mongo -d -p 27017:27017 mongodb/mongodb-community-server:latest

<h3>6- Sur DockerDesktop, un nouveau conteneur nommé "mongo" sera créé. Lancez ce conteneur.

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/7f51e8c6-f42c-4843-ba2f-bda4d4647107)




<h2>Installation de package pour node.js</h2>

<h3>7- Allez dans l'invite de commande et tapez: cd Downloads/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj-main/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj-main/Projet</h3>

![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/118306367/f743e3d7-56fc-485e-9da6-aa88697d37f4)

<h3>8- Dans ce répertoire, tapez ceci pour installer les paquets nécessaires au fonctionnement de l'application:</h3>

npm install mysql2 bcrypt express paypal-rest-sdk dateformat mongodb nodemailer nodemailer-smtp-transport google-auth-library --save

<h2>Configuration du compte PayPal</h2>

<h3>Vous aurez besoin d'un compte paypal afin d'accéder au mode de paiement du site web. Si vous avez déjà un compte de PayPal, vous pouvez passez les étapes suivantes: </h3>

1.Tout d'abord, rendez-vous chez le site de Paypal[^4] afin de créer un compte.

2.Ensuite, choisissez Personal Sign up for free.
![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/edcbc2d7-2375-4f15-b541-62d720af8801)

3.Puis, choisissez votre pays auquel vous vivez présentement.
<img width="807" alt="image" src="https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/79621100-60e0-4a3b-ae6a-157d7eaa91c0">

4.Après, insérez un adresse courriel existant dont vous utilisez.
<img width="919" alt="image" src="https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/62e14dd3-d91d-4025-9aba-bbdf16c0cec3">

5.Ensuite, insérez votre numéro téléphone.
<img width="751" alt="image" src="https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/5ca24b02-8cfd-4924-b977-0d04bfcd5584">

6.Puis, insérez un mot de passe pour votre compte.
<img width="695" alt="image" src="https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/01b9be6e-5960-4aef-867b-00364d8d007e">

7.Après, insérez vos informations personnelles.
<img width="736" alt="image" src="https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/3e8fdb20-eb50-4d1d-8979-05cccf368ed1">

8.Finalement, insérez votre adresse, cochez la 1ière case et cliquez «Agree and create account» et ensuite cliquez «Not now».
<img width="741" alt="image" src="https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/337f1b86-c4c9-4e39-8179-8d1e5f291e4c">

<h3>Lorsque vous avez fini de configurer votre compte PayPal, suivez les étapes suivantes afin d'accéder à votre compte sandbox pour le fonctionnement du paiement sur le site web:</h3>

1.Tout d'abord, rendez-vous sur le site de PayPal Développeur[^5] pour accéder à votre compte sandbox et connectez-vous avec votre compte PayPal.

2.Ensuite, cliquez sur « Tools » en haut de la page d'accueil, puis cliquez sur « Developer ».
![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/185f7ac1-736d-4241-b4d6-e218e36dd154)

3.Puis, descendez avec votre souris jusqu'à apercevoir « Sandbox accounts », puis cliquez dessus.
![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/3c8986fc-b379-4cb5-a651-5635afbc24d7)

4.Ensuite, cliquez sur les trois points sur l'un des deux comptes présentés devant vous, puis cliquez sur « View/Edit account ».
![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/f5735304-de4b-4253-9534-178265f14c3b)


5.Ensuite, sauvegardez quelque part l'adresse courriel et le mot de passe du compte sandbox affichés devant vous pour effectuer le paiement sur le site web plus tard. Si vous le souhaitez, vous pouvez modifier l'adresse courriel et le mot de passe à votre convenance.
<img width="1498" alt="image" src="https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/ce115644-c5a6-4553-94fd-d5c5f23371e2">


6.Finalement, insérez CAD 100,000 dans le compte sandbox pour vous permettre d'acheter autant de produits que vous le souhaitez. Si vous n'avez plus d'argent dans le compte sandbox, ajoutez simplement à nouveau CAD 100,000.
![image](https://github.com/ridhadosh/TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj/assets/116312683/fd51d8f1-812d-46dd-b591-0fa12f60100e)


<h2>Lancement de l'application</h2>

<h3>8- Toujours dans le même répertoire dans terminal, tapez:</h3>
node server.js
<h3>9- Allez dans un navigateur et tapez: </h3>
http://localhost:4000

<br>



[^1]: Lien pour installer Docker Desktop sur votre machine : https://docs.docker.com/get-docker/
[^2]: Lien pour installer Node.js sur votre machine : https://nodejs.org/en/download
[^3]: Lien pour installer l'éditeur Visual Studio Code : https://code.visualstudio.com/download
[^4]: Lien pour accèder au site de PayPal : https://www.paypal.com/ky/webapps/mpp/account-selection
[^5]: Lien pour accèder au site de développeur PayPal : https://developer.paypal.com/home



<br>

> [!TIP]
> Assurez d'avoir au moins 10GB stockage libre sur votre ordinateur afin d'installer tous les environnements requis.

