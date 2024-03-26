CREATE TABLE utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    prenom           VARCHAR(100) NOT NULL,
    nom              VARCHAR(100) NOT NULL,
    nom_utilisateur  VARCHAR(100) NOT NULL,
    adresse_courriel VARCHAR(100) NOT NULL,
    mot_de_passe     VARCHAR(30) NOT NULL
);

CREATE TABLE adresse_de_livraison (
    id_adresselivraison INT NOT NULL AUTO_INCREMENT,
    adresse             VARCHAR(50) NOT NULL,
    code_postal         VARCHAR(6) NOT NULL,
    ville               VARCHAR(50) NOT NULL,
    pays                VARCHAR(50) NOT NULL,
    id_utilisateur      INT NOT NULL,
    PRIMARY KEY (id_adresselivraison),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur (id_utilisateur)
);

CREATE TABLE carte_de_credit (
    id_carte_de_credit INT NOT NULL AUTO_INCREMENT,
    id_paiement        INT NOT NULL,
    numero_de_carte    INT NOT NULL,
    date_expiration    DATE NOT NULL,
    nom_titulaire      VARCHAR(100) NOT NULL,
    code_cvc           VARCHAR(3) NOT NULL,
    PRIMARY KEY (id_carte_de_credit)
);

CREATE TABLE categorie_du_produit (
    id_categorie          INT NOT NULL,
    id_produit            INT NOT NULL,
    nom_categorie         VARCHAR(50) NOT NULL,
    description_categorie VARCHAR(500) NOT NULL,
    PRIMARY KEY (id_categorie)
);

CREATE TABLE commande (
    id_commande     INT NOT NULL,
    id_utilisateur  INT NOT NULL,
    date_commande   DATE NOT NULL,
    statut_commande VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_commande)
);

CREATE TABLE commentaire (
    id_commentaire      INT NOT NULL,
    id_utilisateur      INT NOT NULL,
    commentaire         VARCHAR(1000) NOT NULL,
    date_du_commentaire DATE NOT NULL,
    PRIMARY KEY (id_commentaire)
);

CREATE TABLE detail_commande (
    id_detail_commande INT NOT NULL AUTO_INCREMENT,
    id_commande        INT NOT NULL,
    id_produit         INT NOT NULL,
    quantite           INT NOT NULL,
    prix_unitaire      DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_detail_commande)
);

CREATE TABLE detail_panier (
    id_detail_panier INT NOT NULL AUTO_INCREMENT,
    id_panier        INT NOT NULL,
    id_produit       INT NOT NULL,
    quantite         INT NOT NULL,
    PRIMARY KEY (id_detail_panier)
);

CREATE TABLE paiement (
    id_paiement         INT NOT NULL,
    id_commande         INT NOT NULL,
    montant_payer       INT NOT NULL,
    date_de_transaction DATE NOT NULL,
    mode_de_paiement    VARCHAR(500) NOT NULL,
    PRIMARY KEY (id_paiement)
);

CREATE TABLE panier (
    id_panier      INT NOT NULL AUTO_INCREMENT,
    id_utilisateur INT NOT NULL,
    date_ajout     DATE NOT NULL,
    PRIMARY KEY (id_panier),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);

CREATE TABLE produit (
    id_produit               INT NOT NULL AUTO_INCREMENT,
    nom_produit              VARCHAR(50) NOT NULL,
    description_produit      VARCHAR(500) NOT NULL,
    prix_unitaire            INT NOT NULL,
    stock_disponible         INT NOT NULL,
    couleur                  VARCHAR(50),
    dimensions               VARCHAR(50),
    cpu                      VARCHAR(50),
    gpu                      VARCHAR(50),
    ram                      VARCHAR(50),
    stockage                 VARCHAR(50),
    Systeme_dexploitation    VARCHAR(50),
    taille_ecran             VARCHAR(50),
    image_url                VARCHAR(200),
    PRIMARY KEY (id_produit)
);

CREATE TABLE relation_10 (
    utilisateur_id_utilisateur INT NOT NULL,
    commentaire_id_commentaire INT NOT NULL,
    PRIMARY KEY (utilisateur_id_utilisateur, commentaire_id_commentaire)
);

CREATE TABLE relation_11 (
    commande_id_commande INT NOT NULL,
    paiement_id_paiement INT NOT NULL,
    PRIMARY KEY (commande_id_commande, paiement_id_paiement)
);

CREATE TABLE relation_12 (
    paiement_id_paiement      INT NOT NULL,
    c_de_c_id_carte_de_credit INT NOT NULL,
    PRIMARY KEY (paiement_id_paiement, c_de_c_id_carte_de_credit)
);

CREATE TABLE relation_14 (
    utilisateur_id_utilisateur     INT NOT NULL,
    adr_de_liv_id_adresselivraison INT NOT NULL,
    PRIMARY KEY (utilisateur_id_utilisateur, adr_de_liv_id_adresselivraison)
);

CREATE TABLE relation_15 (
    utilisateur_id_utilisateur INT NOT NULL,
    c_de_c_id_carte_de_credit  INT NOT NULL,
    PRIMARY KEY (utilisateur_id_utilisateur, c_de_c_id_carte_de_credit)
);

CREATE TABLE relation_16 (
    utilisateur_id_utilisateur INT NOT NULL,
    panier_id_panier           INT NOT NULL,
    PRIMARY KEY (utilisateur_id_utilisateur, panier_id_panier)
);

CREATE TABLE relation_17 (
    panier_id_panier               INT NOT NULL,
    detail_panier_id_detail_panier INT NOT NULL,
    PRIMARY KEY (panier_id_panier, detail_panier_id_detail_panier)
);

CREATE TABLE relation_18 (
    produit_id_produit             INT NOT NULL,
    detail_panier_id_detail_panier INT NOT NULL,
    PRIMARY KEY (produit_id_produit, detail_panier_id_detail_panier)
);

CREATE TABLE relation_19 (
    commande_id_commande       INT NOT NULL, 
    det_com_id_detail_commande INT NOT NULL,
    PRIMARY KEY (commande_id_commande, det_com_id_detail_commande)
);

CREATE TABLE relation_20 (
    produit_id_produit         INT NOT NULL, 
    det_com_id_detail_commande INT NOT NULL,
    PRIMARY KEY (produit_id_produit, det_com_id_detail_commande)
);

CREATE TABLE relation_6 (
    utilisateur_id_utilisateur INT NOT NULL,
    commande_id_commande       INT NOT NULL,
    PRIMARY KEY (utilisateur_id_utilisateur, commande_id_commande)
);

CREATE TABLE relation_7 (
    commande_id_commande           INT NOT NULL,
    adr_de_liv_id_adresselivraison INT NOT NULL,
    PRIMARY KEY (commande_id_commande, adr_de_liv_id_adresselivraison)
);

CREATE TABLE relation_9 (
    produit_id_produit       INT NOT NULL,
    cat_du_prod_id_categorie INT NOT NULL,
    PRIMARY KEY (produit_id_produit, cat_du_prod_id_categorie)
);



ALTER TABLE relation_10
    ADD CONSTRAINT relation_10_commentaire_fk FOREIGN KEY ( commentaire_id_commentaire )
        REFERENCES commentaire ( id_commentaire );

ALTER TABLE relation_10
    ADD CONSTRAINT relation_10_utilisateur_fk FOREIGN KEY ( utilisateur_id_utilisateur )
        REFERENCES utilisateur ( id_utilisateur );

ALTER TABLE relation_11
    ADD CONSTRAINT relation_11_commande_fk FOREIGN KEY ( commande_id_commande )
        REFERENCES commande ( id_commande );

ALTER TABLE relation_11
    ADD CONSTRAINT relation_11_paiement_fk FOREIGN KEY ( paiement_id_paiement )
        REFERENCES paiement ( id_paiement );

ALTER TABLE relation_12
    ADD CONSTRAINT relation_12_carte_de_credit_fk FOREIGN KEY ( c_de_c_id_carte_de_credit)
        REFERENCES carte_de_credit ( id_carte_de_credit );

ALTER TABLE relation_12
    ADD CONSTRAINT relation_12_paiement_fk FOREIGN KEY ( paiement_id_paiement )
        REFERENCES paiement ( id_paiement );


ALTER TABLE relation_14
    ADD CONSTRAINT rel_14_adr_de_liv_fkFOREIGN KEY ( adr_de_liv_id_adresselivraison)
        REFERENCES adresse_de_livraison ( id_adresselivraison );

ALTER TABLE relation_14
    ADD CONSTRAINT relation_14_utilisateur_fk FOREIGN KEY ( utilisateur_id_utilisateur )
        REFERENCES utilisateur ( id_utilisateur );

ALTER TABLE relation_15
    ADD CONSTRAINT relation_15_carte_de_credit_fk FOREIGN KEY ( c_de_c_id_carte_de_credit)
        REFERENCES carte_de_credit ( id_carte_de_credit );

ALTER TABLE relation_15
    ADD CONSTRAINT relation_15_utilisateur_fk FOREIGN KEY ( utilisateur_id_utilisateur )
        REFERENCES utilisateur ( id_utilisateur );

ALTER TABLE relation_16
    ADD CONSTRAINT relation_16_panier_fk FOREIGN KEY ( panier_id_panier )
        REFERENCES panier ( id_panier );

ALTER TABLE relation_16
    ADD CONSTRAINT relation_16_utilisateur_fk FOREIGN KEY ( utilisateur_id_utilisateur )
        REFERENCES utilisateur ( id_utilisateur );

ALTER TABLE relation_17
    ADD CONSTRAINT relation_17_detail_panier_fk FOREIGN KEY ( detail_panier_id_detail_panier )
        REFERENCES detail_panier ( id_detail_panier );

ALTER TABLE relation_17
    ADD CONSTRAINT relation_17_panier_fk FOREIGN KEY ( panier_id_panier )
        REFERENCES panier ( id_panier );

ALTER TABLE relation_18
    ADD CONSTRAINT relation_18_detail_panier_fk FOREIGN KEY ( detail_panier_id_detail_panier )
        REFERENCES detail_panier ( id_detail_panier );

ALTER TABLE relation_18
    ADD CONSTRAINT relation_18_produit_fk FOREIGN KEY ( produit_id_produit )
        REFERENCES produit ( id_produit );

ALTER TABLE relation_19
    ADD CONSTRAINT relation_19_commande_fk FOREIGN KEY ( commande_id_commande )
        REFERENCES commande ( id_commande );

ALTER TABLE relation_19
    ADD CONSTRAINT relation_19_detail_commande_fk FOREIGN KEY ( det_com_id_detail_commande )
        REFERENCES detail_commande ( id_detail_commande );

ALTER TABLE relation_20
    ADD CONSTRAINT relation_20_detail_commande_fk FOREIGN KEY ( det_com_id_detail_commande )
        REFERENCES detail_commande ( id_detail_commande );

ALTER TABLE relation_20
    ADD CONSTRAINT relation_20_produit_fk FOREIGN KEY ( produit_id_produit )
        REFERENCES produit ( id_produit );

ALTER TABLE relation_6
    ADD CONSTRAINT relation_6_commande_fk FOREIGN KEY ( commande_id_commande )
        REFERENCES commande ( id_commande );

ALTER TABLE relation_6
    ADD CONSTRAINT relation_6_utilisateur_fk FOREIGN KEY ( utilisateur_id_utilisateur )
        REFERENCES utilisateur ( id_utilisateur );

ALTER TABLE relation_7
    ADD CONSTRAINT rel_7_adr_de_liv_fk FOREIGN KEY ( adr_de_liv_id_adresselivraison)
        REFERENCES adresse_de_livraison ( id_adresselivraison );

ALTER TABLE relation_7
    ADD CONSTRAINT relation_7_commande_fk FOREIGN KEY ( commande_id_commande )
        REFERENCES commande ( id_commande );


ALTER TABLE relation_9
    ADD CONSTRAINT relation_9_cat_du_prod_fk  FOREIGN KEY ( cat_du_prod_id_categorie )
        REFERENCES categorie_du_produit ( id_categorie );

ALTER TABLE relation_9
    ADD CONSTRAINT relation_9_produit_fk FOREIGN KEY ( produit_id_produit )
        REFERENCES produit ( id_produit );


