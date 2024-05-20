CREATE TABLE adresse_de_livraison (
    id_adresselivraison INT NOT NULL AUTO_INCREMENT,
    adresse             VARCHAR(50) NOT NULL,
    code_postal         VARCHAR(6) NOT NULL,
    ville               VARCHAR(50) NOT NULL,
    pays                VARCHAR(50) NOT NULL,
    province            VARCHAR(255) NOT NULL,
    id_session          VARCHAR(255),
    PRIMARY KEY (id_adresselivraison)
);

CREATE TABLE commande (
    id_commande     INT NOT NULL AUTO_INCREMENT,
    id_session      VARCHAR(255) NOT NULL;,
    date_commande   DATE NOT NULL,
    statut_commande VARCHAR(100) NOT NULL,
    prix_total      DECIMAL(10, 2) NULL, 
    PRIMARY KEY (id_commande)
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

CREATE TABLE panier (
    id_panier      INT NOT NULL AUTO_INCREMENT,
    id_session     VARCHAR(255),
    date_ajout     DATE NOT NULL,
    PRIMARY KEY (id_panier)
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

CREATE TABLE relation_7 (
    commande_id_commande           INT NOT NULL,
    adr_de_liv_id_adresselivraison INT NOT NULL,
    PRIMARY KEY (commande_id_commande, adr_de_liv_id_adresselivraison)
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

ALTER TABLE relation_7
    ADD CONSTRAINT rel_7_adr_de_liv_fk FOREIGN KEY ( adr_de_liv_id_adresselivraison)
        REFERENCES adresse_de_livraison ( id_adresselivraison );

ALTER TABLE relation_7
    ADD CONSTRAINT relation_7_commande_fk FOREIGN KEY ( commande_id_commande )
        REFERENCES commande ( id_commande );



