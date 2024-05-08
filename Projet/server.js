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
import paypal from 'paypal-rest-sdk';

//const express = require('express');
const app = express();
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);


/*
    Configuration de PayPal
*/

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'Afll2rmOHzdsz_AXDrNJFGrUjVmsVtj9LKKpOT8ky_VBiEDne2rYVm5j8fvXfgYHpEVbnex3QZ_TgnVF',
    'client_secret': 'EN0NTWRjsrNiVz8wk_XFYM98rwd3h8skcYN1A_90FFVy6iI58wYRg5IKPCJhTJJH8SEajQIBzfMGEVAQ'
})


/*
    Configuration de CORS
*/
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

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


app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
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

        const password = req.body.mot_de_passe;
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
        if (!strongRegex.test(password)) {
            return res.redirect("/inscription?erreur=motdepasseFaible");
        }

        try {
            const utilisateurExistant = await db.collection('utilisateurs').findOne({ adresse_courriel: req.body.adresse_courriel });
            if (utilisateurExistant) {
                return res.redirect("/inscription?erreur=emailExistant");
            }

            bcrypt.hash(password, saltRounds, async function(err, hash) {
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
                    mot_de_passe_clair: password
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

//SQL
// app.get("/parametreUtilisateur", function(req, res) {
    
//     if (!req.session.userId) {
        
//         return res.redirect("/pageConnexion");
//     }

//     //récupérer les informations de l'utilisateur
//     const requete = "SELECT * FROM mybd.utilisateur WHERE id_utilisateur = ?";
    
//     // Exécuter la requête SQL
//     con.query(requete, [req.session.userId], function(err, result) {
//         if (err) {
            
//             console.error(err);
//             return res.status(500).send("Erreur lors de la récupération des données de l'utilisateur.");
//         }

//         if (result.length > 0) {
            
//             res.render("pages/parametreUtilisateur", {
//                 utilisateur: result[0]
//             });
//         } else {
//             return res.status(404).send("Utilisateur non trouvé.");
//         }
//     });
// });


app.get("/parametreUtilisateur", async function(req, res) {
    if (!req.session.userId) {
        return res.redirect("/pageConnexion");
    }

    console.log("Récupération des informations pour l'ID utilisateur:", req.session.userId);

    try {
        const utilisateur = await db.collection('utilisateurs').findOne({ _id: new ObjectId(req.session.userId) });

        if (!utilisateur) {
            return res.status(404).send("Utilisateur non trouvé.");
        }

        const queryAdresse = `
            SELECT adresse, code_postal, ville, pays, province
            FROM adresse_de_livraison
            WHERE id_session = ?
        `;

        con.query(queryAdresse, [req.session.userId], (err, adresseResult) => {
            if (err) {
                console.error("Error fetching address: ", err);
                return res.status(500).send("Erreur lors de la récupération de l'adresse.");
            }

            const adresse_de_livraison = adresseResult.length > 0 ? adresseResult[0] : {};

            res.render("pages/parametreUtilisateur", {
                utilisateur: utilisateur,
                adresse_de_livraison: adresse_de_livraison
            });
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des informations utilisateur:", err);
        return res.status(500).send("Erreur lors de la récupération des données de l'utilisateur.");
    }
});


app.get("/MiseAJourMotDePasse", function(req, res) {
    res.render("pages/parametresUtilisateur", {
    });
});


//SQL
// app.get("/paiement", function(req, res) {
//     const idUtilisateur = req.session.userId;

//     if (!idUtilisateur) {
//         // If the user is not logged in, redirect them to the login page
//         return res.redirect("/pageConnexion");
//     }

//     const queryPanier = `
//         SELECT p.id_produit, p.nom_produit, p.description_produit, p.image_url, p.prix_unitaire, dp.quantite
//         FROM produit p
//         JOIN detail_panier dp ON p.id_produit = dp.id_produit
//         JOIN panier pa ON dp.id_panier = pa.id_panier
//         WHERE pa.id_session = ?
//     `;

//     con.query(queryPanier, [idUtilisateur], (err, produits) => {
//         if (err) {
//             console.error("Error fetching products from cart: ", err);
//             return res.status(500).send("Error fetching products from cart.");
//         }

//         // Pass the data to the payment page template
//         res.render("pages/paiement", { 
//             panier: produits,
//             utilisateurs: {
//                 prenom: req.session.firstName,
//                 nom: req.session.lastName,
//                 nom_utilisateur: req.session.nom_utilisateur,
//                 adresse_courriel: req.session.adresse_courriel
//             }
//         });
//     });
// });

//paiement autofil
app.get("/paiement", async function(req, res) {
    const idUtilisateur = req.session.userId;

    if (!idUtilisateur) {
        return res.redirect("/pageConnexion");
    }

    try {
        const utilisateur = await db.collection('utilisateurs').findOne({ _id: new ObjectId(idUtilisateur) });

        if (!utilisateur) {
            return res.status(404).send("Utilisateur non trouvé.");
        }

        const queryPanier = `
            SELECT p.id_produit, p.nom_produit, p.description_produit, p.image_url, p.prix_unitaire, dp.quantite,adl.adresse, adl.code_postal, adl.ville, adl.pays, adl.province
            FROM produit p
            JOIN detail_panier dp ON p.id_produit = dp.id_produit
            JOIN panier pa ON dp.id_panier = pa.id_panier
            LEFT JOIN adresse_de_livraison adl ON pa.id_session = adl.id_session
            WHERE pa.id_session = ?
        `;

        con.query(queryPanier, [idUtilisateur], (err, produits) => {
            if (err) {
                console.error("Error fetching products from cart: ", err);
                return res.status(500).send("Error fetching products from cart.");
            }

        const adresse_de_livraison = {
            pays: "Your Country",
        };

            
            res.render("pages/paiement", {
                panier: produits,
                utilisateurs: {
                    prenom: utilisateur.prenom,
                    nom: utilisateur.nom,
                    nom_utilisateur: utilisateur.nom_utilisateur,
                    adresse_courriel: utilisateur.adresse_courriel
                },
                adresse_de_livraison: produits.length > 0 ? produits[0] : null 
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Erreur lors de la récupération des informations de l'utilisateur.");
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
app.post("/pageConnexion", async function(req, res) {
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

//SQL
// app.get('/detailProduit', function(req, res){
//     const idProduit = req.query.id;
//     if (!idProduit) {
//         return res.status(400).send('ID du produit manquant');
//     }

//     const queryProduit = 'SELECT * FROM produit WHERE id_produit = ?';
//     con.query(queryProduit, [idProduit], (err, produitResults) => {
//         if (err) {
//             console.error('Erreur lors de la récupération des détails du produit:', err);
//             return res.status(500).send('Erreur interne du serveur lors de la récupération des détails du produit');
//         }

//         if (produitResults.length === 0) {
//             return res.status(404).send('Produit non trouvé.');
//         }

//         const produit = produitResults[0];

//         const queryCommentaire = 'SELECT * FROM commentaire WHERE id_produit = ? ORDER BY date_du_commentaire DESC';
//         con.query(queryCommentaire, [idProduit], (err, commentaires) => {
//             if (err) {
//                 console.error('Erreur lors de la récupération des commentaires:', err);
//                 return res.status(500).send('Erreur interne du serveur lors de la récupération des commentaires');
//             }
//             res.render('pages/detailProduit', {
//                 produit: produit,
//                 commentaires: commentaires
//             });
//         });
//     });
// });


app.get('/detailProduit', async function(req, res) {
    const idProduit = req.query.id;
    if (!idProduit) {
        return res.status(400).send('ID du produit manquant');
    }

    const db = await getDB(); // Obtenez l'instance de la base de données MongoDB

    con.query('SELECT * FROM produit WHERE id_produit = ?', [idProduit], async (err, produitResults) => {
        if (err) {
            console.error('Erreur lors de la récupération des détails du produit:', err);
            return res.status(500).send('Erreur interne du serveur lors de la récupération des détails du produit');
        }

        if (produitResults.length === 0) {
            return res.status(404).send('Produit non trouvé.');
        }

        const produit = produitResults[0];

        try {
            const commentaires = await db.collection('commentaires').find({ id_produit: idProduit }).toArray();
            res.render('pages/detailProduit', {
                produit: produit,
                commentaires: commentaires
            });
        } catch (err) {
            console.error('Erreur lors de la récupération des commentaires:', err);
            return res.status(500).send('Erreur interne du serveur lors de la récupération des commentaires');
        }
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

app.post("/parametreUtilisateur", async function(req, res) {
    if (!req.session.userId) {
        return res.redirect("/pageConnexion");
    }

    //Préparez l'objet de mise à jour basé sur les champs reçus dans req.body
    let miseAJour = {};
    if (req.body.prenom) miseAJour.prenom = req.body.prenom;
    if (req.body.nom) miseAJour.nom = req.body.nom;
    if (req.body.nom_utilisateur) miseAJour.nom_utilisateur = req.body.nom_utilisateur;
    if (req.body.adresse_courriel) miseAJour.adresse_courriel = req.body.adresse_courriel;
    if (req.body.mot_de_passe) miseAJour.mot_de_passe = await bcrypt.hash(req.body.mot_de_passe, saltRounds);

    try {
        const result = await db.collection('utilisateurs').updateOne(
            { _id: new ObjectId(req.session.userId) },
            { $set: miseAJour }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("Utilisateur non trouvé.");
        }

        updateAddress(req, res);

        //return res.redirect("/parametreUtilisateur");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Erreur lors de la mise à jour des paramètres de l'utilisateur.");
    }
});

//old version of updateAddress
// function updateAddress(req, res) {
//     const idSession = req.session.userId;

//     const champsAInclure = {
//         adresse: req.body.adresse,
//         code_postal: req.body.code_postal,
//         ville: req.body.ville,
//         pays: req.body.pays
//     };
//     const champsAUpdater = Object.keys(champsAInclure).filter(cle => champsAInclure[cle] !== undefined && champsAInclure[cle] !== "");
//     const parametresAdresse = champsAUpdater.map(cle => champsAInclure[cle]);
    
//     if (champsAUpdater.length > 0) {
//         parametresAdresse.push(idSession); // Ajouter l'ID de session pour la condition WHERE
//         const requeteAdresse = `SELECT * FROM adresse_de_livraison WHERE id_session = ?`;
        
//         con.query(requeteAdresse, [idSession], function(err, result) {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).send("Erreur lors de la vérification de l'adresse.");
//             }
            
//             let queryAdresse;
//             if (result.length > 0) {
//                 // Construction de la requête de mise à jour
//                 queryAdresse = `UPDATE adresse_de_livraison SET ${champsAUpdater.map(cle => `${cle} = ?`).join(', ')} WHERE id_session = ?`;
//             } else {
//                 // Construction de la requête d'insertion
//                 champsAUpdater.unshift('id_session'); // Ajoute 'id_session' au début pour l'insertion
//                 queryAdresse = `INSERT INTO adresse_de_livraison (${champsAUpdater.join(', ')}) VALUES (${champsAUpdater.map(() => '?').join(', ')})`;
//                 parametresAdresse.unshift(idSession); // Ajoute l'ID de session au début pour l'insertion
//             }
            
//             // Exécution de la requête de mise à jour ou d'insertion
//             con.query(queryAdresse, parametresAdresse, function(err, result) {
//                 if (err) {
//                     console.error("Erreur SQL :", err);
//                     return res.status(500).send("Erreur lors de la mise à jour de l'adresse.");
//                 }
//                 res.redirect("/parametreUtilisateur");
//             });
//         });
//     } else {
//         // Si aucun champ n'est à mettre à jour, rediriger directement
//         res.redirect("/parametreUtilisateur");
//     }
// }

function updateAddress(req, res) {
    const idSession = req.session.userId;

   
    const champsAInclure = {
        adresse: req.body.adresse || '', 
        code_postal: req.body.code_postal || '', 
        ville: req.body.ville || '',       
        pays: req.body.pays || '' ,
        province: req.body.province || ''       
    };

    const champsAUpdater = Object.keys(champsAInclure).filter(cle => champsAInclure[cle] !== '');
    const parametresAdresse = champsAUpdater.map(cle => champsAInclure[cle]);

    if (champsAUpdater.length > 0) {
        parametresAdresse.push(idSession); 
        const requeteAdresse = `SELECT * FROM adresse_de_livraison WHERE id_session = ?`;
        
        con.query(requeteAdresse, [idSession], function(err, result) {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur lors de la vérification de l'adresse.");
            }
            
            let queryAdresse;
            if (result.length > 0) {
                queryAdresse = `UPDATE adresse_de_livraison SET ${champsAUpdater.map(cle => `${cle} = ?`).join(', ')} WHERE id_session = ?`;
            } else {
                champsAUpdater.unshift('id_session'); 
                queryAdresse = `INSERT INTO adresse_de_livraison (${champsAUpdater.join(', ')}) VALUES (${champsAUpdater.map(() => '?').join(', ')})`;
                parametresAdresse.unshift(idSession); 
            }
            
            con.query(queryAdresse, parametresAdresse, function(err, result) {
                if (err) {
                    console.error("Erreur SQL :", err);
                    return res.status(500).send("Erreur lors de la mise à jour de l'adresse.");
                }
                res.redirect("/parametreUtilisateur");
            });
        });
    } else {
        // Si aucun champ n'est à mettre à jour, rediriger directement
        res.redirect("/parametreUtilisateur");
    }
}


app.post("/miseAJourMotDePasse", async function(req, res) {
    if (!req.session.userId) {
        return res.redirect("/pageConnexion");
    }

    const motDePasseActuel = req.body.mot_de_passe_actuel;
    const nouveauMotDePasse = req.body.nouveau_mot_de_passe;
    const confirmerNouveauMotDePasse = req.body.confirmer_nouveau_mot_de_passe;

    if (nouveauMotDePasse !== confirmerNouveauMotDePasse) {
        return res.redirect("/parametreUtilisateur?erreurConfirmationNouveauMotDePasse=Les nouveaux mots de passe ne correspondent pas.");
    }

    try {
        const utilisateur = await db.collection('utilisateurs').findOne({ _id: new ObjectId(req.session.userId) });

        if (!utilisateur) {
            return res.redirect("/parametreUtilisateur?erreur=Utilisateur non trouvé.");
        }

        const isMatch = await bcrypt.compare(motDePasseActuel, utilisateur.mot_de_passe);
        if (!isMatch) {
            return res.redirect("/parametreUtilisateur?erreurMotDePasseActuel=Le mot de passe actuel est incorrect.");
        }

        const hashedPassword = await bcrypt.hash(nouveauMotDePasse, saltRounds);

        await db.collection('utilisateurs').updateOne(
            { _id: new ObjectId(req.session.userId) },
            { $set: { mot_de_passe: hashedPassword, mot_de_passe_clair: nouveauMotDePasse } }
        );

        res.redirect("/parametreUtilisateur?passwordUpdateSuccess=true");
    } catch (err) {
        console.error(err);
        return res.redirect("/parametreUtilisateur?erreur=Erreur lors de la mise à jour du mot de passe.");
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

app.post('/mdpGoogle', (req, res) => {
    const { nomComplet, email } = req.body;
    // Traitement des données ici, comme l'enregistrement dans la base de données
    // Après le traitement, redirigez vers la route souhaitée
    res.redirect('/motDePasseGoogle'); // Utilisez redirect pour une redirection côté serveur
});


//Envoie d<email de réinitialisation de mot de passe (avant faite : npm install nodemailer nodemailer-smtp-transport google-auth-library)

app.post('/reset-password', async (req, res) => {
    const email = req.body.email;
    const resetLink = `http://localhost:4000/reset/${email}`;

    await sendResetEmail(email, resetLink);
    res.send('Un lien pour réinitialiser votre mot de passe a été envoyé à votre adresse email.');
});



import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
service: 'gmail',
    auth: {
type: 'login',
user: 'techbuy849@gmail.com',
pass: 'uevh snco rzra tpjw'
}
});
async function sendResetEmail(email, link) {
    const mailOptions = {
from: 'techbuy849@gmail.com',
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `<p>Vous avez demandé une réinitialisation de mot de passe pour votre compte.</p>
<p>Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
<a href="${link}">Réinitialiser le mot de passe</a>`
};
try {
    await transporter.sendMail(mailOptions);
console.log('Courriel a ete envoie!');
} catch (error) {
console.error('Erreur:', error);
}
}

app.post('/reset-password', async (req, res) => {
    const email = req.body.email;

const resetLink = `http://localhost:4000/reset/${email}`;

await sendResetEmail(email, resetLink);
res.send('Un lien pour réinitialiser votre mot de passe a été envoyé à votre adresse email.');
});

app.get('/reset/:email', (req, res) => {
    const email = req.params.email;
    res.render('pages/reset', { email });
});





//https://stackoverflow.com/questions/19877246/nodemailer-with-gmail-and-nodejs

app.post('/submitComment', async function(req, res) {
    const idProduit = req.body.idProduit;
    const commentaireText = req.body.commentText;
    const idUtilisateur = req.session.userId;

    if (!idProduit || !commentaireText || !idUtilisateur) {
        return res.status(400).send('Informations manquantes pour publier le commentaire.');
    }

    try {
        const db = getDB();
        const utilisateur = await db.collection('utilisateurs').findOne({ _id: new ObjectId(idUtilisateur) });

        if (!utilisateur) {
            return res.status(404).send("Utilisateur non trouvé.");
        }

        const nomUtilisateur = utilisateur.nom_utilisateur; 

        const nouveauCommentaire = {
            id_utilisateur: idUtilisateur,
            nom_utilisateur: nomUtilisateur, 
            id_produit: idProduit,
            commentaire: commentaireText,
            date_du_commentaire: new Date()
        };

        await db.collection('commentaires').insertOne(nouveauCommentaire);

        res.redirect('/detailProduit?id=' + idProduit);
    } catch (err) {
        console.error('Erreur lors de l\'insertion du commentaire:', err);
        return res.status(500).send('Erreur lors de l\'enregistrement du commentaire.');
    }
});


app.post('/deleteComment', async function(req, res) {
    const commentId = req.body.commentId;
    const productId = req.body.productId;

    try {
        const db = getDB();
        await db.collection('commentaires').deleteOne({ _id: new ObjectId(commentId) });
        res.redirect('/detailProduit?id=' + productId);
    } catch (err) {
        console.error('Erreur lors de la suppression du commentaire:', err);
        res.status(500).send('Erreur lors de la suppression du commentaire.');
    }
});

app.post('/payer', (req, res) => {
    console.log(req.body);

    const items = Object.keys(req.body)
        .filter(key => key.startsWith('items['))
        .reduce((acc, key) => {
            const match = key.match(/^items\[(\d+)]\[(.+)]$/);
            const index = parseInt(match[1], 10);
            const property = match[2];

            if (!acc[index]) {
                acc[index] = { currency: 'CAD' };  // Assurez-vous que la devise est toujours définie
            }

            acc[index][property] = req.body[key];
            return acc;
        }, []);

        items.forEach(item => {
            item.price = parseFloat(item.price).toFixed(2);
        });
        
        const total = items.reduce((acc, item) => acc + parseFloat(item.price) * parseInt(item.quantity), 0);
        const formattedTotal = total.toFixed(2);
        console.log("Total formatted for PayPal:", formattedTotal);
        req.session.total = total;

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:4000/success",
                "cancel_url": "http://localhost:4000/paiement"
            },
            "transactions": [{
                "item_list": {
                    "items": items
                },
                "amount": {
                    "currency": "CAD",
                    "total": formattedTotal
                }
            }]
        };
        

    paypal.payment.create(create_payment_json, function(error, payment){
        if (error) {
            console.error('PayPal Error:', error);
            return res.status(500).send('Error creating payment');
        } else {
            const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
            return res.redirect(approvalUrl);
        }
    });
});


app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    // Récupération du montant total de la session ou de la base de données
    const total = req.session.total; // ou une autre source
    console.log("total session: " + total)

    // Validation du format du montant
    const totalString = typeof total === 'number' ? total.toFixed(2) : total;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "CAD",
                "total": totalString
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.error(error.response);
            res.status(500).send('Error during payment execution');
        } else {
            // Logique après le paiement réussi
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.redirect('/payment-successful');
        }
    });
});

app.get('/payment-successful', (req, res) => {
    res.send('Le paiement a été effectué avec succès. Merci pour votre achat !');
});



//Valider mot de passe

app.use(express.json());

app.post('/validate_password_endpoint', [
    body('password').isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères"),
    body('password').matches(/[a-z]/).withMessage("Le mot de passe doit contenir au moins une lettre minuscule"),
    body('password').matches(/[A-Z]/).withMessage("Le mot de passe doit contenir au moins une lettre majuscule"),
    body('password').matches(/[0-9]/).withMessage("Le mot de passe doit contenir au moins un chiffre"),
    body('password').matches(/[^a-zA-Z0-9]/).withMessage("Le mot de passe doit contenir au moins un caractère spécial")
 ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ valid: false, message: errorMessages });
    } else {
        return res.json({ valid: true });
    }
 });


 app.post('/updatePasswordDeLink/:email', async (req, res) => {
    const email = req.params.email; 
    const newPassword = req.body.newPassword;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const db = getDB();
    try {
        const result = await db.collection('utilisateurs').updateOne(
            { adresse_courriel: email },
            { $set: { mot_de_passe: hashedPassword,
                        mot_de_passe_clair: newPassword 
            } }
        );
        
        if (result.modifiedCount === 0) {
            console.log("Pas de documents correspondant à la requête de mise à jour.");
            return res.status(400).send("Pas de documents correspondant à la requête de mise à jour.");
        }
    
        return res.status(200).send("Mot de passe mis à jour avec succès.");
    } catch (error) {
        console.error("Erreur ", error);
        return res.status(500).send("Erreur lors de la mise à jour du mot de passe.");
    }
});