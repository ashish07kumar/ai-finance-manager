const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const controller = require('./budgets.controller');
const { budgetSchema, updateBudgetSchema } = require('./budgets.validation');

const router = express.Router();

router.use(authenticate);
router.get('/', controller.list);
router.post('/', validate(budgetSchema), controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', validate(updateBudgetSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
