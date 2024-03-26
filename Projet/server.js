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
    
        
        res.render("pages/index", {
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
    let query = 'SELECT * FROM produit WHERE nom_produit LIKE ? OR description_produit LIKE ?';
    if (req.query.sortBy === 'priceAsc') {
        query += " ORDER BY prix_unitaire ASC";
    }
    else if (req.query.sortBy === 'priceDesc') {
        query += " ORDER BY prix_unitaire DESC";
    }
    else if (req.query.sortBy === 'nomDesc') {
        query += " ORDER BY nom_produit DESC";
    }
    else if (req.query.sortBy === 'nomAsc') {
        query += " ORDER BY nom_produit ASC";
    } 
    con.query(query, [`%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la recherche :', err);
            return res.status(500).send('Erreur interne du serveur');
        }
      
        res.render('pages/recherche', { items: rows, searchTerm: searchTerm });
    });
});



app.post("/parametreUtilisateur", function(req, res) {
    if (!req.session.userId) {
        //Si l'utilisateur n'est pas connecté, redirige vers la page de connexion
        return res.redirect("/pageConnexion");
    }

    const requete = "SELECT * FROM mybd.utilisateur WHERE id_utilisateur = ?";
    con.query(requete, [req.session.userId], function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la vérification de l'utilisateur.");
        }

        if (result.length > 0) {
            let query = "UPDATE mybd.utilisateur SET ";
            let params = [];
            let mettreAJour = false;

            if (req.body.nom_utilisateur && req.body.nom_utilisateur.trim() !== "") {
                query += "nom_utilisateur = ?, ";
                params.push(req.body.nom_utilisateur);
                mettreAJour = true;
            }

            if (req.body.adresse_courriel && req.body.adresse_courriel.trim() !== "") {
                query += "adresse_courriel = ?, ";
                params.push(req.body.adresse_courriel);
                mettreAJour = true;
            }

            if (mettreAJour) {
                query = query.slice(0, -2); //Enlever la dernière virgule et espace
                query += " WHERE id_utilisateur = ?";
                params.push(req.session.userId);

                //Exécuter la mise à jour
                con.query(query, params, function(err, result) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Erreur lors de la mise à jour de l'utilisateur.");
                    }
                    //Continuer avec la mise à jour de l'adresse si besoin
                    updateAddress(req, res);
                });
            } else {
                //Si aucun champ utilisateur à mettre à jour, continuer directement avec l'adresse
                updateAddress(req, res);
            }
        } else {
            
            return res.status(404).send("Utilisateur non trouvé.");
        }
    });
});

function updateAddress(req, res) {
    const requeteAdresse = "SELECT * FROM mybd.adresse_de_livraison WHERE id_utilisateur = ?";
    con.query(requeteAdresse, [req.session.userId], function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la vérification de l'adresse.");
        }

        let queryAdresse = "";
        let parametresAdresse = [];
        let mettreAJour = false; //Ajouté pour vérifier si une mise à jour est nécessaire

        if (result.length > 0) {
            queryAdresse = "UPDATE mybd.adresse_de_livraison SET ";
            if (req.body.adresse) {
                queryAdresse += "adresse = ?, ";
                parametresAdresse.push(req.body.adresse);
                mettreAJour = true;
            }
    
            if (req.body.code_postal) {
                queryAdresse += "code_postal = ?, ";
                parametresAdresse.push(req.body.code_postal);
                mettreAJour = true;
            }
    
            if (req.body.ville) {
                queryAdresse += "ville = ?, ";
                parametresAdresse.push(req.body.ville);
                mettreAJour = true;
            }
    
            if (req.body.pays) {
                queryAdresse += "pays = ?, ";
                parametresAdresse.push(req.body.pays);
                mettreAJour = true;
            }
    
            if (mettreAJour) {
                queryAdresse = queryAdresse.slice(0, -2); //Enlever la dernière virgule et espace
                queryAdresse += " WHERE id_utilisateur = ?";
                parametresAdresse.push(req.session.userId);
            }
        } else if (req.body.adresse || req.body.code_postal || req.body.ville || req.body.pays) {
            // Insertion seulement si au moins un champ est rempli
            queryAdresse = "INSERT INTO mybd.adresse_de_livraison (id_utilisateur, adresse, code_postal, ville, pays) VALUES (?, ?, ?, ?, ?)";
            parametresAdresse = [
                req.session.userId,
                req.body.adresse,
                req.body.code_postal,
                req.body.ville,
                req.body.pays
            ];
            mettreAJour = true;
        }
        if (mettreAJour) {
            //Exécuter la requête de mise à jour ou d'insertion pour l'adresse
            con.query(queryAdresse, parametresAdresse, function(err, result) {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Erreur lors de la mise à jour de l'adresse.");
                }
                //Redirection après mise à jour de l'adresse
                return res.redirect("/pageAffichagePrincipale");
            });
        } else {
            return res.redirect("/pageAffichagePrincipale");
        }
    });
}




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



