const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { upload } = require('../../middlewares/upload.middleware');
const controller = require('./transactions.controller');
const { transactionSchema, updateTransactionSchema, recurringSchema } = require('./transactions.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', validate(transactionSchema), controller.create);
router.get('/recurring/all', controller.listRecurring);
router.post('/recurring', validate(recurringSchema), controller.createRecurring);
router.get('/:id', controller.getOne);
router.put('/:id', validate(updateTransactionSchema), controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/receipt', upload.single('receipt'), controller.uploadReceipt);

module.exports = router;
