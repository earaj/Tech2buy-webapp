/*
    Importation des modules requis
*/

import express, { query } from "express";
import session from "express-session";
import path from "path";
import {fileURLToPath} from "url";
import mysql from "mysql";
import {body, validationResult} from "express-validator";
import dateFormat from "dateformat";

const app = express();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

/*
    Connect to server
*/

const server = app.listen(4000,function()
{
console.log("serveur fonctionne sur 4000.... ! ")
});

/*
    Configuration de EJS
*/

app.set("views", path.join(_dirname,"views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:false}))

app.use(session({
    secret: 'votreSecretIci',
    resave: false, 
    saveUninitialized: false, 
    cookie: { secure: false } 
  }));

/*
    Importation de Bootstrap
*/

app.use("/js", express.static(_dirname + "/node_modules/bootstrap/dist/js"));
app.use("/css", express.static(_dirname + "/node_modules/bootstrap/dist/css"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("./views/Images"));
app.use(express.static("./assets"))
app.use(express.static("./views"))

app.use(function(req, res, next) {
    res.locals.req = req;
    next();
});

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
    con.query("SELECT * FROM e_events ORDER BY e_start_date DESC", function(err,result){
        if(err) throw err;
        res.render("pages/index", {
            siteTitle: "Application simple",
            pageTitle: "",
            items: result
        });
    });
});


app.get("/event/add", function(req,res)
{
    con.query("SELECT * FROM e_events ORDER BY e_start_date DESC", function(err,result){
        if(err) throw err;
        res.render("pages/add-event",{
            siteTitle: "Application simple",
            pageTitle: "Ajouter un nouvel événement",
            items: result
        });
    });
});

app.post("/event/add",function(req,res){
    const requete = "INSERT INTO e_events(e_name,e_start_date,e_start_end,e_desc,e_location) VALUES (?,?,?,?,?)";
    const parametres = [
        req.body.e_name,
        dateFormat(req.body.e_start_date, "yyyy-mm-dd"),
        dateFormat(req.body.e_start_end, "yyyy-mm-dd"),
        req.body.e_desc,
        req.body.e_location,         
    ];
    console.log(parametres);
    con.query(requete,parametres,function(err,result){
        if(err) throw err;
        res.redirect("/");
    });
});

/*
    Permettre l'utilisation de body lors des POST request
*/



app.get("/event/edit/:id", function (req, res) {
    const requete = "SELECT * FROM e_events WHERE e_id = ?";
    const parametres = [req.params.id];
    con.query(requete, parametres, function (err, result) {
      if (err) throw err;
      result[0].e_start_date = dateFormat(result[0].e_start_date, "yyyy-mm-dd");
      result[0].e_start_end = dateFormat(result[0].e_start_end, "yyyy-mm-dd");
      res.render("pages/edit-event.ejs", {
        siteTitle: "Application simple",
        pageTitle: "Editer événement : " + result[0].E_NAME,
        items: result,
      });
    });
});

app.post("/event/edit/:id", function (req,res)
{
    const requete = "UPDATE e_events SET e_name = ?, e_start_date = ?, e_start_end = ?, e_desc = ?, e_location = ?, WHERE e_id = ? ";
    const parametres =[
        req.body.e_name,
        req.body.e_start_date,
        req.body.e_start_end,
        req.body.e_desc,
        req.body.e_location,
        req.body.e_id
    ];
    con.query(requete, parametres, function(err,result)
    {
        if(err) throw err;
        res.redirect("/");
    });
});
app.get("/event/delete/:id", function (req,rest){
    const requete = "DELETE FROM e_events WHERE e_id = ?";
    con.query(requete,[req.params.id], function(err,result){
        if(err) throw err;
        res.redirect("/");
     });
});
//Permet aller au page connexion
app.get("/pageConnexion", function(req, res) {
    res.render("pages/pageConnexion", { erreur: req.query.erreur });
});
//permet aller au page index
app.get("/index", function(req, res) {
    res.render("pages/index", {
    });
});

app.get("/inscription", function(req, res) {
    res.render("pages/inscription", {
    });
});

app.get("/pageAffichagePrincipale", function(req, res) {
    res.render("pages/pageAffichagePrincipale", {
    });
});


app.get("/panier", function(req, res) {
    res.render("pages/panier", {
    });
});

app.get("/parametreUtilisateur", function(req, res) {
    res.render("pages/parametreUtilisateur", {
    });
});

//app.get("/detailProduit", function(req, res) {
    //res.render("pages/detailProduit", {
  //  });
//});

//Fonction pour la creation de compte utilisateurs
app.post("/inscription", function(req, res) {
    const requete  = "INSERT INTO mybd.utilisateur (prenom, nom, nom_utilisateur, adresse_courriel, mot_de_passe) VALUES (?, ?, ?, ?, ?)";
    const parametres = [
      req.body.prenom,
      req.body.nom,
      req.body.nom_utilisateur,
      req.body.adresse_courriel,
      req.body.mot_de_passe
    ];
    con.query(requete, parametres, function(err, result) {
      if (err) throw err;
      res.redirect("/pageConnexion");
    });
  });

//Fonction pour la connection au compte des utilisateurs
app.post("/connexion", function(req, res) {
    const requete  = "SELECT * FROM mybd.utilisateur WHERE adresse_courriel = ? AND mot_de_passe = ?";
    const parametres = [req.body.courriel, req.body.motdepasse];
    con.query(requete, parametres, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            req.session.userId = result[0].id_utilisateur;
            req.session.save(function(err) {
                // Assurez-vous que la session est sauvegardée avant de rediriger
                res.redirect("/pageAffichagePrincipale");
            });
            //res.redirect("/pageAffichagePrincipale");
        } else {
            res.redirect("/pageConnexion?erreur=1");
        }
    });
});

app.get('/detailProduit', (req, res) => {
    const productID = req.query.id;
    const query = 'SELECT * FROM produit WHERE id_produit = ?'; 
    con.query(query, [productID], (err, rows) => {
        if (err) {
            console.error('Erreur', err);
            return res.status(500).send('Erreur interne du serveur');
        }
        const produit = rows[0];
        res.render('pages/detailProduit', { produit: produit});
    });
});


//Fonction pour la recherche des produits
app.get('/recherche', (req, res) => {
    const searchTerm = req.query.query;
    const query = 'SELECT * FROM produit WHERE nom_produit LIKE ? OR description_produit LIKE ?'; 
    con.query(query, [`%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la recherche :', err);
            return res.status(500).send('Erreur interne du serveur');
        }
      
        res.render('pages/recherche', { items: rows, searchTerm: searchTerm });
    });
});


//Fonction pour les parametres de l'utilisateur
// app.post("/parametreUtilisateur", function(req, res) {

//     if (!req.session.userId) {
//         // Si l'utilisateur n'est pas connecté, redirigez-le vers la page de connexion
//         return res.redirect("/pageConnexion");
//     }
//     const requete = "UPDATE mybd.utilisateur SET nom_utilisateur = ?, adresse_courriel = ? WHERE id_utilisateur = ?";
//     const parametres = [
//         req.body.nom_utilisateur, // Le nouveau nom_utilisateur souhaité par l'utilisateur
//         req.body.adresse_courriel, // La nouvelle adresse courriel souhaitée par l'utilisateur
//         req.session.userId // L'id_utilisateur pour identifier de manière unique l'utilisateur à mettre à jour
//     ];
//     con.query(requete, parametres, function(err, result) {
//         if (err) throw err;
//         res.redirect("/pageAffichagePrincipale");
//     });
// });

app.post("/parametreUtilisateur", function(req, res) {

    if (!req.session.userId) {
        // Si l'utilisateur n'est pas connecté, redirige vers la page de connexion
        return res.redirect("/pageConnexion");
    }
    const requete = "UPDATE mybd.utilisateur SET nom_utilisateur = ?, adresse_courriel = ? WHERE id_utilisateur = ?";
    const parametres = [
        req.body.nom_utilisateur, 
        req.body.adresse_courriel, 
        req.session.userId 
    ];
    con.query(requete, parametres, function(err, result) {
        if (err) throw err;

        const requeteAdresse = "SELECT * FROM mybd.adresse_de_livraison WHERE id_utilisateur = ?";
        con.query(requeteAdresse, [req.session.userId], function(err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur lors de la vérification de l'adresse.");
            }
    
            let queryAdresse = "";
            let parametresAdresse = [];
    
            if (result.length > 0) {
                queryAdresse = "UPDATE mybd.adresse_de_livraison SET ";
                if (req.body.adresse) {
                    queryAdresse += "adresse = ?, ";
                    parametresAdresse.push(req.body.adresse);
                }
        
                if (req.body.code_postal) {
                    queryAdresse += "code_postal = ?, ";
                    parametresAdresse.push(req.body.code_postal);
                }
        
                if (req.body.ville) {
                    queryAdresse += "ville = ?, ";
                    parametresAdresse.push(req.body.ville);
                }
        
                if (req.body.pays) {
                    queryAdresse += "pays = ?, ";
                    parametresAdresse.push(req.body.pays);
                }
        
                queryAdresse = queryAdresse.slice(0, -2);
        
                queryAdresse += " WHERE id_utilisateur = ?";
                parametresAdresse.push(req.session.userId);
            } else {
                queryAdresse = "INSERT INTO mybd.adresse_de_livraison (id_utilisateur, adresse, code_postal, ville, pays) VALUES (?, ?, ?, ?, ?)";
                parametresAdresse = [
                    req.session.userId,
                    req.body.adresse,
                    req.body.code_postal,
                    req.body.ville,
                    req.body.pays
                ];
            }
    
            con.query(queryAdresse, parametresAdresse, function(err, result) {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Erreur lors de la mise à jour");
                }
                
            });
        });
        res.redirect("/pageAffichagePrincipale");
    });
});


app.get("/parametreUtilisateur", function(req, res) {
    //Vérifiez que l'utilisateur est connecté et a un id_utilisateur stocké
    if (req.session.userId) {
        res.render("pages/parametreUtilisateur", {
            id_utilisateur: req.session.userId
        });
    } else {
        //Si non connecté, redirige vers la page de connexion
        res.redirect("/pageConnexion");
    }
});


//Ajouter une route POST pour gérer l'ajout d'un produit au panier
app.post("/ajouterAuPanier", function(req, res) {
    const produit = {
        image_url: req.body.image_url,
        nom_produit: req.body.nom_produit,
        description_produit: req.body.description_produit
    };
    //Stocker le produit dans la session de l'utilisateur
    if (!req.session.panier) {
        req.session.panier = [];
    }
    req.session.panier.push(produit);
    res.redirect("back");
});

app.get("/panier", function(req, res) {
    res.render("pages/panier", {
        req: req  
    });
});



});
