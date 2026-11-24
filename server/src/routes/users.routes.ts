import { Router } from 'express';
import {
  UsersController,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersQuerySchema,
} from '../controllers/users.controller';
import { userContactsRouter } from './contacts.routes';
import { AlertsController, listAlertsQuerySchema } from '../controllers/alerts.controller';
import { validate } from '../middleware/validate';
import { userParamSchema } from '../controllers/contacts.controller';

export const usersRouter = Router();

// Sub-resource: /api/v1/users/:userId/contacts
usersRouter.use('/:userId/contacts', userContactsRouter);

// Sub-resource: /api/v1/users/:userId/alerts
usersRouter.get(
  '/:userId/alerts',
  validate({ params: userParamSchema, query: listAlertsQuerySchema }),
  AlertsController.listForUser
);

// Standard User CRUD
usersRouter.post(
  '/',
  validate({ body: createUserSchema }),
  UsersController.create
);

usersRouter.get(
  '/',
  validate({ query: listUsersQuerySchema }),
  UsersController.list
);

usersRouter.get(
  '/:id',
  validate({ params: userIdParamSchema }),
  UsersController.getById
);

usersRouter.patch(
  '/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  UsersController.update
);

usersRouter.delete(
  '/:id',
  validate({ params: userIdParamSchema }),
  UsersController.delete
);
