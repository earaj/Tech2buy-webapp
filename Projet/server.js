/*
    Importation des modules requis
*/

import express, { query } from "express";
import session from "express-session";
import path from "path";
import {fileURLToPath} from "url";
import mysql from "mysql2";
//import mysql from "mysql2";
import {body, validationResult} from "express-validator";
import dateFormat from "dateformat";
import bcrypt from 'bcrypt';
const saltRounds = 10;


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

    //RUN CE CODE POUR HACHER LES MOTS DE PASSE EXISTANTS DES UTILISATEURS

    // con.query("SELECT id_utilisateur, mot_de_passe FROM mybd.utilisateur", function (err, result) {
    //     if (err) throw err;

    //     result.forEach(user => {
    //         bcrypt.hash(user.mot_de_passe, saltRounds, function(err, hash) {
    //             if (err) {
    //                 console.error("Erreur lors du hachage du mot de passe pour l'utilisateur ID:", user.id_utilisateur);
    //                 return;
    //             }

    //             con.query("UPDATE utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?", [hash, user.id_utilisateur], function(err, result) {
    //                 if (err) {
    //                     console.error("Erreur lors de la mise à jour du mot de passe haché pour l'utilisateur ID:", user.id_utilisateur);
    //                     return;
    //                 }
    //                 console.log("Mot de passe mis à jour pour l'utilisateur ID:", user.id_utilisateur);
    //             });
    //         });
    //     });
    // });
});


/*
    Connection au server MongoDB
*/


import { MongoClient,ObjectId } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'mybd';
let db;

async function connectDB() {
  try {
    const client = await MongoClient.connect(url);
    db = client.db(dbName);
    console.log("Connecté à MongoDB");

    setupRoutes();
  } catch (err) {
    console.error("Erreur lors de la connexion à MongoDB", err);
  }
};

function getDB() {
  if (!db) {
    throw Error("La base de données n'est pas encore initialisée");
  }
  return db;
};


function setupRoutes() {
app.post("/inscription", async function(req, res) {
    const db = getDB(); 

    //Vérifier d'abord si l'adresse courriel existe déjà
    try {
        const utilisateurExistant = await db.collection('utilisateurs').findOne({ adresse_courriel: req.body.adresse_courriel });
        if (utilisateurExistant) {
            //Si un utilisateur existe déjà avec cette adresse courriel, renvoyez une erreur
            return res.redirect("/inscription?erreur=emailExistant");
        }

        //Si l'utilisateur n'existe pas, hachez le mot de passe et créez l'utilisateur
        bcrypt.hash(req.body.mot_de_passe, saltRounds, async function(err, hash) {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur lors du hachage du mot de passe.");
            }

          
            const nouvelUtilisateur = {
                prenom: req.body.prenom,
                nom: req.body.nom,
                nom_utilisateur: req.body.nom_utilisateur,
                adresse_courriel: req.body.adresse_courriel,
                mot_de_passe: hash, 
                mot_de_passe_clair: req.body.mot_de_passe 
            };
            try {
                await db.collection('utilisateurs').insertOne(nouvelUtilisateur);
                
                req.session.userId = nouvelUtilisateur._id;
                req.session.save(err => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Erreur lors de la sauvegarde de la session.");
                    }
                    return res.redirect("/pageAffichagePrincipale");
                });
            } catch (err) {
                if (err && err.code === 11000) {
                    return res.redirect("/inscription?erreur=emailExistant");
                } else {
                    console.error(err);
                    return res.status(500).send("Erreur lors de l'inscription de l'utilisateur.");
                }
            }
        });
    } catch (err) {
        console.error("Erreur lors de la vérification de l'utilisateur:", err);
        return res.status(500).send("Erreur serveur lors de la vérification.");
    }
});
}

connectDB();



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

app.get("/parametreUtilisateur", function(req, res) {
    
    if (!req.session.userId) {
        
        return res.redirect("/pageConnexion");
    }

    //récupérer les informations de l'utilisateur
    const requete = "SELECT * FROM mybd.utilisateur WHERE id_utilisateur = ?";
    
    // Exécuter la requête SQL
    con.query(requete, [req.session.userId], function(err, result) {
        if (err) {
            
            console.error(err);
            return res.status(500).send("Erreur lors de la récupération des données de l'utilisateur.");
        }

        if (result.length > 0) {
            
            res.render("pages/parametreUtilisateur", {
                utilisateur: result[0]
            });
        } else {
            return res.status(404).send("Utilisateur non trouvé.");
        }
    });
});


app.get("/MiseAJourMotDePasse", function(req, res) {
    res.render("pages/parametresUtilisateur", {
    });
});


app.get("/paiement", async function(req, res) {
    const idUtilisateur = req.session.userId;
    
    if (!idUtilisateur) {
        // If the user is not logged in, redirect them to the login page
        return res.redirect("/pageConnexion");
    }

    try {
        // Assuming `Panier` is your model for the shopping cart in your NoSQL database
        const produits = await Panier.aggregate([
            {
                $match: { id_utilisateur: idUtilisateur }
            },
            {
                $lookup: {
                    from: "produit",
                    localField: "id_produit",
                    foreignField: "_id",
                    as: "produits"
                }
            },
            {
                $unwind: "$produits"
            },
            {
                $project: {
                    _id: "$produits._id",
                    nom_produit: "$produits.nom_produit",
                    description_produit: "$produits.description_produit",
                    image_url: "$produits.image_url",
                    prix_unitaire: "$produits.prix_unitaire",
                    quantite: "$quantite"
                }
            }
        ]);

        // Pass the data to the payment page template
        res.render("pages/paiement", { 
            panier: produits,
            utilisateur: {
                prenom: req.session.firstName,
                nom: req.session.lastName,
                nom_utilisateur: req.session.nom_utilisateur,
                adresse_courriel: req.session.adresse_courriel
            }
        });
    } catch (err) {
        console.error("Error fetching products from cart: ", err);
        return res.status(500).send("Error fetching products from cart.");
    }
});

app.get("/mdpOublie", function(req, res) {
    res.render("pages/mdpOublie", {
    });
});

//Fonction pour afficher les produits SQL
app.get("/panier", function(req, res) {
    const idUtilisateur = req.session.userId;

    if (!idUtilisateur) {
        //Si l'utilisateur n'est pas connecté, redirigez-le vers la page de connexion
        return res.redirect("/pageConnexion");
    }

    const queryPanier = `
        SELECT p.id_produit, p.nom_produit, p.description_produit, p.image_url, p.prix_unitaire, dp.quantite
        FROM produit p
        JOIN detail_panier dp ON p.id_produit = dp.id_produit
        JOIN panier pa ON dp.id_panier = pa.id_panier
        WHERE pa.id_session = ?
    `;

    con.query(queryPanier, [idUtilisateur], (err, produits) => {
        if (err) {
            console.error("Erreur lors de la récupération des produits du panier : ", err);
            return res.render("pages/panier", { panier: [] });
        }

        //console.log("Produits du panier :", produits);
        res.render("pages/panier", { panier: produits });
    });
});   

//Fonction pour déconnecter l'utilisateur
app.get("/deconnect", function(req, res) {

    req.session.destroy(function(err) {
        if(err) {
            console.error("Erreur de deconnexion de session: ", err);
            return res.status(500).send("Erreur de deconnexion");
        }
        res.redirect("/pageConnexion");
    });
})

// //Fonction pour la creation de compte utilisateurs SQL
// app.post("/inscription", function(req, res) {
//     //Hacher le mot de passe avant de l'insérer
//     bcrypt.hash(req.body.mot_de_passe, saltRounds, function(err, hash) {
//         if (err) {
//             console.error(err);
//             return res.status(500).send("Erreur lors du hachage du mot de passe.");
//         }
        
//         const requete = "INSERT INTO mybd.utilisateur (prenom, nom, nom_utilisateur, adresse_courriel, mot_de_passe, mot_de_passe_clair) VALUES (?, ?, ?, ?, ?, ?)";
//         const parametres = [
//             req.body.prenom,
//             req.body.nom,
//             req.body.nom_utilisateur,
//             req.body.adresse_courriel,
//             hash, //Mot de passe haché
//             req.body.mot_de_passe //Mot de passe en clair
//         ];

//         con.query(requete, parametres, function(err, result) {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).send("Erreur lors de l'inscription de l'utilisateur.");
//             }
//             res.redirect("/pageConnexion");
//         });
//     });
// });

// //Fonction pour la connexion au compte des utilisateurs SQL
// app.post("/connexion", function(req, res) {
//     const requete = "SELECT * FROM mybd.utilisateur WHERE adresse_courriel = ?";
//     const courriel = req.body.courriel;
    
//     con.query(requete, [courriel], function(err, result) {
//         if (err) {
//             console.error(err);
//             return res.status(500).send("Erreur lors de la recherche de l'utilisateur.");
//         }
//         if (result.length > 0) {
//             const utilisateur = result[0];
//             bcrypt.compare(req.body.motdepasse, utilisateur.mot_de_passe, function(err, isMatch) {
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).send("Erreur lors de la vérification du mot de passe.");
//                 }
//                 if (isMatch) {
//                     req.session.userId = utilisateur.id_utilisateur;
//                     req.session.save(function(err) {
//                         if (err) {
//                             console.error(err);
//                             return res.status(500).send("Erreur lors de la sauvegarde de la session.");
//                         }
//                         res.redirect("/pageAffichagePrincipale");
//                     });
//                 } else {
//                     //Mot de passe incorrect
//                     res.redirect("/pageConnexion?erreur=1");
//                 }
//             });
//         } else {
//             //Aucun utilisateur trouvé avec cet e-mail
//             res.redirect("/pageConnexion?erreur=1");
//         }
//     });
// });

//NoSQL
app.post("/connexion", async function(req, res) {
    const courriel = req.body.courriel;
    console.log(`Tentative de connexion pour l'email: ${courriel}`);

    try {
        const db = getDB();
        const utilisateur = await db.collection('utilisateurs').findOne({ adresse_courriel: courriel });

        if (!utilisateur) {
            console.log("Aucun utilisateur trouvé avec cet email");
            return res.redirect("/pageConnexion?erreur=1");
        }

        bcrypt.compare(req.body.motdepasse, utilisateur.mot_de_passe, (err, isMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur lors de la vérification du mot de passe.");
            }
            if (isMatch) {
                req.session.userId = utilisateur._id;
                req.session.save(err => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Erreur lors de la sauvegarde de la session.");
                    }
                    return res.redirect("/pageAffichagePrincipale");
                });
            } else {
                console.log("Mot de passe incorrect");
                return res.redirect("/pageConnexion?erreur=1");
            }
        });
    } catch (err) {
        console.error("Erreur lors de la recherche de l'utilisateur:", err);
        res.status(500).send("Erreur lors de la connexion.");
    }
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


//Fonction pour mettre à jour les paramètres de l'utilisateur
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

            if (req.body.prenom && req.body.prenom.trim() !== "") {
                query += "prenom = ?, ";
                params.push(req.body.prenom);
                mettreAJour = true;
            }

            if (req.body.nom && req.body.nom.trim() !== "") {
                query += "nom = ?, ";
                params.push(req.body.nom);
                mettreAJour = true;
            }

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

            if (req.body.mot_de_passe && req.body.mot_de_passe.trim() !== "") {
                query += "mot_de_passe = ?, ";
                params.push(req.body.mot_de_passe);
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
                return res.redirect("/parametreUtilisateur");
            });
        } else {
            return res.redirect("/parametreUtilisateur");
        }
    });
}

//Fonction pour la réinitialisation du mot de passe
app.post("/miseAJourMotDePasse", function(req, res) {
    if (!req.session.userId) {
        return res.redirect("/pageConnexion");
    }

    const motDePasseActuel = req.body.mot_de_passe_actuel;
    const nouveauMotDePasse = req.body.nouveau_mot_de_passe;
    const confirmerNouveauMotDePasse = req.body.confirmer_nouveau_mot_de_passe;

    if (nouveauMotDePasse !== confirmerNouveauMotDePasse) {
        return res.redirect("/parametreUtilisateur?erreurConfirmationNouveauMotDePasse=Les nouveaux mots de passe ne correspondent pas.");
    }

    const requete = "SELECT mot_de_passe FROM mybd.utilisateur WHERE id_utilisateur = ?";
    con.query(requete, [req.session.userId], function(err, result) {
        if (err || result.length === 0) {
            console.error(err);
            return res.redirect("/parametreUtilisateur?erreur=Erreur lors de la vérification de l'utilisateur.");
        }

        bcrypt.compare(motDePasseActuel, result[0].mot_de_passe, function(err, isMatch) {
            if (err || !isMatch) {
                return res.redirect("/parametreUtilisateur?erreurMotDePasseActuel=Le mot de passe actuel est incorrect.");
            }

            bcrypt.hash(nouveauMotDePasse, saltRounds, function(err, hashedPassword) {
                if (err) {
                    console.error(err);
                    return res.redirect("/parametreUtilisateur?erreur=Erreur lors du hachage du nouveau mot de passe.");
                }

                //Mise à jour à la fois du mot de passe haché et du mot de passe en clair
                const queryMiseAJour = "UPDATE mybd.utilisateur SET mot_de_passe = ?, mot_de_passe_clair = ? WHERE id_utilisateur = ?";
                con.query(queryMiseAJour, [hashedPassword, nouveauMotDePasse, req.session.userId], function(err) {
                    if (err) {
                        console.error(err);
                        return res.redirect("/parametreUtilisateur?erreur=Erreur lors de la mise à jour du mot de passe.");
                    }
                    res.redirect("/parametreUtilisateur?passwordUpdateSuccess=true");
                });
            });
        });
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


//BONNE VERSION NoSQL
app.post("/ajouterAuPanier", function(req, res) {
    if (!req.session.userId) {
        console.log("Aucun utilisateur connecté");
        return res.redirect("/pageConnexion");
    }

    const idSession = req.session.userId;
    console.log("ID de session:", idSession);
    const id_produit = req.body.id_produit;
    const quantite = parseInt(req.body.quantite) || 1;

    
    con.query("SELECT id_panier FROM panier WHERE id_session = ?", [idSession], (err, panier) => {
        if (err) {
            console.error("Erreur lors de la récupération de l'ID du panier :", err);
            return res.status(500).send("Erreur serveur lors de la récupération de l'ID du panier.");
        }

        let id_panier;
        if (panier.length === 0) {
            console.log(`Aucun panier trouvé pour l'ID de session ${idSession}, création d'un nouveau panier.`);
            con.query("INSERT INTO panier (id_session, date_ajout) VALUES (?, NOW())", [idSession], (err, result) => {
                if (err) {
                    console.error("Erreur lors de la création du panier :", err);
                    return res.status(500).send("Erreur serveur lors de la création du panier.");
                }
                id_panier = result.insertId;
                console.log(`Panier créé avec l'ID: ${id_panier}`);
                ajouterOuMettreAJourProduit(id_panier, id_produit, quantite);
            });
        } else {
            id_panier = panier[0].id_panier;
            console.log(`Panier trouvé pour l'ID de session ${idSession} avec l'ID: ${id_panier}`);
            ajouterOuMettreAJourProduit(id_panier, id_produit, quantite);
        }
    });

    function ajouterOuMettreAJourProduit(id_panier, id_produit, quantite) {
        console.log(`Ajout ou mise à jour du produit ${id_produit} dans le panier ${id_panier}`);
        con.query("SELECT id_detail_panier, quantite FROM detail_panier WHERE id_panier = ? AND id_produit = ?", [id_panier, id_produit], (err, detailPanier) => {
            if (err) {
                console.error("Erreur lors de la vérification du produit dans le panier :", err);
                return res.status(500).send("Erreur lors de la vérification du produit dans le panier.");
            }

            if (detailPanier.length > 0) {
                const updatedQuantite = detailPanier[0].quantite + quantite;
                console.log(`Mise à jour de la quantité pour le produit ${id_produit} dans le panier ${id_panier}`);
                con.query("UPDATE detail_panier SET quantite = ? WHERE id_detail_panier = ?", [updatedQuantite, detailPanier[0].id_detail_panier], (err, updateResult) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la quantité du produit :", err);
                        return res.status(500).send("Erreur lors de la mise à jour de la quantité du produit.");
                    }
                    console.log(`Quantité mise à jour pour le produit ${id_produit}. Redirection en cours.`);
                    res.redirect("back");
                });
            } else {
                console.log(`Ajout du nouveau produit ${id_produit} dans le panier ${id_panier}`);
                con.query("INSERT INTO detail_panier (id_panier, id_produit, quantite) VALUES (?, ?, ?)", [id_panier, id_produit, quantite], (err, insertResult) => {
                    if (err) {
                        console.error("Erreur lors de l'ajout du produit au panier :", err);
                        return res.status(500).send("Erreur lors de l'ajout du produit au panier.");
                    }
                    console.log(`Produit ${id_produit} ajouté au panier. Redirection en cours.`);
                    res.redirect("back");
                });
            }
        });
    }
    
});

//Supprimer une produit de panier
app.post("/supprimerDuPanier", function(req, res) {
    const idUtilisateur = req.session.userId;
    const idProduit = req.body.id_produit;

    if (!idUtilisateur || !idProduit) {
        return res.redirect("/pageConnexion");
    }

    const querySupprimerProduit = `
        DELETE FROM detail_panier 
        WHERE id_panier = (
            SELECT id_panier FROM panier WHERE id_session = ?
        ) 
        AND id_produit = ?
    `;

    con.query(querySupprimerProduit, [idUtilisateur, idProduit], (err, result) => {
        if (err) {
            console.error("Ne peut pas supprime l'article: ", err);
            return res.redirect("/panier");
        }
        res.redirect("/panier");
    });
});

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    let nomComplet = profile.getName();
    let email = profile.getEmail();
    let [prenom, ...nomParts] = nomComplet.split(' ');
    let nom = nomParts.join(' '); 
    const query = `INSERT INTO utilisateurs (prenom, nom, nom_utilisateur, adresse_courriel) VALUES (?, ?, ?, ?)`;

    // Utilisation de la connexion à la base de données existante
    // Supposons que 'db' est votre client de base de données MySQL
    db.execute(query, [prenom, nom, prenom, email], (err, results) => {
        if (err) {
            // Gérer l'erreur ici (par exemple, afficher un message à l'utilisateur)
            console.error('Erreur lors de l\'insertion dans la base de données:', err);
        } else {
            // Opération réussie
            console.log('Utilisateur ajouté avec succès dans la base de données.');
        }
    });
}

app.post('mdpGoogle', (req, res) => {
    const { nomComplet, email } = req.body;
    // Divisez le nomComplet en prénom et nom si nécessaire
    // Stockez les informations nécessaires dans la session ou temporairement

    // Redirection vers motDePasseGoogle.ejs
    // Vous pouvez aussi passer des données à la vue si nécessaire
    res.render('/motDePasseGoogle', { email: email });
});


//Ne toucher pas

//Envoie d<email de réinitialisation de mot de passe (avant faite : npm install nodemailer)
/**
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
        user: "email@exemple.com",
        pass: "email-pass"
    }
});

function envoieCourriel(email, resetLink) {
    const mailOptions = {
        from: "email@exemple.com",
        to: email,
        subject: "Reinitialisation de mot de passe",
        text: `Click ici pour changer votre mot de passe ${resetLink}`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
}
//crrrre un pg
app.post("/reset-password", function(req, res) {
    const email = req.body.courriel;
    const resetLink = "localhost:4000/"; // une page pour chnager le mot de passe
    envoieCourriel(email, resetLink);
    res.send("Envoie!");
}); 
*/