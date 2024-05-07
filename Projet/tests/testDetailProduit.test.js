
//npm install --save-dev jest-express

const { mockRequest, mockResponse } = require('jest-express');
const { getDB } = require('../../Projet'); 

const app = require('../../../TP_Web_Projet_de_Site-Ridha-Thanushan-Dave-Earaj'); 
const routeHandler = app._router.stack.find((r) => r.route && r.route.path === '/detailProduit').route.stack[0].handle;


jest.mock('../../Projet', () => ({
  getDB: jest.fn(),
}));

describe('GET /detailProduit', () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest({
      query: { id: '1' },
    });
    res = mockResponse();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('400 produit missing', async () => {
    req.query.id = undefined;
    await routeHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('ID du produit manquant');
  });

  it('500 connexion echoue', async () => {
    getDB.mockRejectedValue(new Error('Database connexion echoue'));
    await routeHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Erreur interne du serveur lors de la récupération des détails du produit');
  });

  it('404 pas trouve', async () => {
    const mockQuery = jest.fn().mockImplementation((query, callback) => callback(null, []));
    getDB.mockResolvedValue({ collection: () => ({ find: () => ({ toArray: mockQuery }) }) });
    await routeHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Produit non trouvé.');
  });

  it('retourne produit detail', async () => {
    const mockQuery = jest.fn().mockImplementation((query, callback) => callback(null, [{ name: 'Product' }]));
    getDB.mockResolvedValue({ collection: () => ({ find: () => ({ toArray: mockQuery }) }) });
    await routeHandler(req, res);
    expect(res.render).toHaveBeenCalledWith('pages/detailProduit', expect.objectContaining({
      produit: expect.objectContaining({ name: 'Product' }),
    }));
  });
});
