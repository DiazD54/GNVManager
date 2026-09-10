import { Router } from 'express';
import { ReconciliationController } from '../../../interfaces/controllers/reconciliation.controller';

const router = Router();
const reconciliationController = new ReconciliationController();

router.post('/', reconciliationController.saveRecord);
router.get('/', reconciliationController.getHistory);
router.patch('/:id/sale', reconciliationController.updateSale);

export default router;
