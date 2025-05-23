const Document = require('../models/Document');

class DocumentController {
    static async saveDocument(req, res) {
        console.log('Chegou requisição para salvar:', req.body); // Adicione este log
        
        // Verifique se o body está correto
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Body inválido' });
        }

        if (!req.session.user) {
            console.error('Usuário não autenticado');
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { filename, content } = req.body;
        const userId = req.session.user.id;

        try {
            // Validação básica
            if (!filename || typeof filename !== 'string') {
                return res.status(400).json({ error: 'Nome do arquivo inválido' });
            }

            let finalFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;

            console.log('Tentando salvar:', { userId, finalFilename }); // Log adicional

            if (req.params.id) {
                // Atualização
                await Document.update(req.params.id, finalFilename, content);
                return res.json({ 
                    success: true, 
                    message: 'Documento atualizado com sucesso' 
                });
            } else {
                // Criação
                const id = await Document.create(userId, finalFilename, content);
                return res.json({ 
                    success: true, 
                    id,
                    filename: finalFilename,
                    message: 'Documento criado com sucesso' 
                });
            }
        } catch (error) {
            console.error('Erro no servidor:', error);
            return res.status(500).json({ 
                error: 'Erro interno no servidor',
                details: error.message 
            });
        }
    }
}