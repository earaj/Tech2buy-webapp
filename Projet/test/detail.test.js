const { expect } = require('chai');
const { query } = require('express');

describe('query', () => {
  it('devrait renvoyer le résultat de la requête', (done) => {
    // Simuler l'objet de connexion
    const con = {
      query: (query, params, callback) => {
        // Simuler une requête réussie
        const result = 'Résultat de la requête';
        callback(null, result);
      }
    };

    // Appeler la fonction de requête
    query(con, 'SELECT * FROM users', (err, result) => {
      expect(err).to.be.null;
      expect(result).to.equal('Résultat de la requête');
      done();
    });
  });

  it('devrait renvoyer une erreur si la requête échoue', (done) => {
    // Simuler l'objet de connexion
    const con = {
      query: (query, params, callback) => {
        // Simuler une erreur de requête
        const error = new Error('Erreur de requête');
        callback(error, null);
      }
    };

    // Appeler la fonction de requête
    query(con, 'SELECT * FROM users', (err, result) => {
      expect(err).to.be.an('error');
      expect(err.message).to.equal('Erreur de requête');
      expect(result).to.be.null;
      done();
    });
  });
});
