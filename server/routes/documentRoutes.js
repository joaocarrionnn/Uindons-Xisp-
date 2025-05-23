const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/DocumentController');
const { checkAuth } = require('../middleware/auth'); // Se tiver middleware

// Rota para salvar (criação e atualização)
router.post('/save', checkAuth, DocumentController.saveDocument);
router.post('/save/:id', checkAuth, DocumentController.saveDocument);
router.post('/save/:id?', async (req, res, next) => {
    try {
        await DocumentController.saveDocument(req, res);
    } catch (error) {
        console.error('Erro na rota:', error);
        res.status(500).json({ 
            error: 'Erro interno',
            details: error.message 
        });
    }
});
module.exports = router;