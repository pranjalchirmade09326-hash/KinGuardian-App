import { Router } from 'express';
import {
  AlertsController,
  createAlertSchema,
  acknowledgeAlertSchema,
  resolveAlertSchema,
  alertIdParamSchema,
  listAlertsQuerySchema,
} from '../controllers/alerts.controller';
import { validate } from '../middleware/validate';

export const alertsRouter = Router();

alertsRouter.post(
  '/',
  validate({ body: createAlertSchema }),
  AlertsController.create
);

alertsRouter.get(
  '/',
  validate({ query: listAlertsQuerySchema }),
  AlertsController.list
);

alertsRouter.get(
  '/:id',
  validate({ params: alertIdParamSchema }),
  AlertsController.getById
);

alertsRouter.patch(
  '/:id/acknowledge',
  validate({ params: alertIdParamSchema, body: acknowledgeAlertSchema }),
  AlertsController.acknowledge
);

alertsRouter.patch(
  '/:id/resolve',
  validate({ params: alertIdParamSchema, body: resolveAlertSchema }),
  AlertsController.resolve
);

alertsRouter.delete(
  '/:id',
  validate({ params: alertIdParamSchema }),
  AlertsController.delete
);
