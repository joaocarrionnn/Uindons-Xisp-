const express = require('express');
const router = express.Router();
const ShortcutController = require('../controllers/ShortcutController');

router.get('/', ShortcutController.getShortcuts);
router.post('/', ShortcutController.createShortcut);
router.put('/:id', ShortcutController.updateShortcut);
router.delete('/:id', ShortcutController.deleteShortcut);
router.post('/positions', ShortcutController.updateShortcutPositions);

module.exports = router;