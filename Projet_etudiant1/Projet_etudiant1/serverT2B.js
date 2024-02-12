import express from "express";
import session from "express-session";
import path from "path";
import {fileURLToPath} from "url";
import mysql from "mysql2";
import {body, validationResult} from "express-validator";
import dateFormat from "dateformat";



const app = express();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const server = app.listen(4000,function()
{
console.log("serveur fonctionne sur 4000.... ! ")
});

/*
    Configuration de EJS
*/

app.set("views", path.join(_dirname,"views"));
app.set("view engine", "ejs");

/*
    Importation de Bootstrap
*/

app.use("/js", express.static(_dirname + "/node_modules/bootstrap/dist/js"));
app.use("/css", express.static(_dirname + "/node_modules/bootstrap/dist/css"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("./assets"))
app.use(express.static("./views"))
/*
    Connection au server MySQL
*/

const con = mysql.createConnection({
    host: "localhost",
    user: "scott",
    password: "oracle",
    database: "mybd"
});

con.connect(function(err){
    if(err) throw err;
    console.log("connected!");
});


/*
    Description des routes
*/
app.get("/", function (req,res){
    
        res.render("pages/pagePrincipal", {
            siteTitle: "Tech2Buy",
            pageTitle: "Page d'accueil",
        });
    });