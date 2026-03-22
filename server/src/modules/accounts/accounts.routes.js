const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./accounts.controller');
const { accountSchema, updateAccountSchema } = require('./accounts.validation');

const router = express.Router();

router.use(authenticate);
router.get('/', controller.list);
router.post('/', validate(accountSchema), controller.create);
router.put('/:id', validate(updateAccountSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
