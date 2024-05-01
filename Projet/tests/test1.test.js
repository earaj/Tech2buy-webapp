// Description: Ce fichier contient les tests unitaires et d'intégration pour la route POST /inscription

// Test unitaire pour la route POST /inscription

//installr: npm install --save-dev jest
///npm test pour tester
const request = require('supertest');
const express = require('express');
const app = express();


const { setupRoutes } = require('../Projet/views/pages');

jest.mock('../Projet/views', () => ({
  getDB: jest.fn(() => ({
    collection: jest.fn(() => ({
      findOne: jest.fn(),
      insertOne: jest.fn(),
    })),
  })),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn((data, salt, callback) => callback(null, 'hashedPassword')),
}));


setupRoutes(app);

describe('POST /inscription', () => {
  test('should create a new user with valid data', async () => {

    const requestBody = {
      prenom: 'era',
      nom: 'nr',
      nom_utilisateur: 'er',
      adresse_courriel: 'jer@example.com',
      mot_de_passe: '123QWEqwe%',
    };

    const response = await request(app)
      .post('/inscription')
      .send(requestBody);

    expect(response.statusCode).toBe(302); 
    expect(response.header.location).toBe('/pageAffichagePrincipale');
  });
});
