const { expect } = require('chai');
const { query } = require('express');
const { MongoClient } = require('mongodb');

describe('setupRoutes', () => {
  let app;
  let db;

  before(async () => {
    const url = 'mongodb://localhost:27017';
    const dbName = 'mybd';
    const client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);

    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    setupRoutes(app, db);
  });

  after(async () => {
    await db.close();

    await app.close();
  });

  it('derige au /inscription?erreur=motdepasseFaible si password est weak', (done) => {
    const req = {
      body: {
        mot_de_passe: 'weakpassword',
      },
    };
    const res = {
      redirect: (url) => {
        expect(url).to.equal('/inscription?erreur=motdepasseFaible');
        done();
      },
    };

    app.handle(req, res);
  });

  it('derige au /inscription?erreur=emailExistant si user deja exist', (done) => {
    const req = {
      body: {
        adresse_courriel: 'utilisateur existan@a.com',
      },
    };
    const res = {
      redirect: (url) => {
        expect(url).to.equal('/inscription?erreur=emailExistant');
        done();
      },
    };

    app.handle(req, res);
  });

  it(' derige au /pageAffichagePrincipale si utlisateur est registrer', (done) => {
    const req = {
      body: {
        prenom: 'era',
        nom: 'nr',
        nom_utilisateur: 'ernr',
        adresse_courriel: 'er@a.com',
        mot_de_passe: '!Aa123456',
      },
      session: {},
    };
    const res = {
      redirect: (url) => {
        expect(url).to.equal('/pageAffichagePrincipale');
        expect(req.session.userId).to.exist;
        done();
      },
    };

    app.handle(req, res);
  });
});