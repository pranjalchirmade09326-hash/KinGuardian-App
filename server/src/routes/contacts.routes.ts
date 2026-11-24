import { Router } from 'express';
import {
  ContactsController,
  createContactSchema,
  updateContactSchema,
  contactParamSchema,
  userParamSchema,
} from '../controllers/contacts.controller';
import { validate } from '../middleware/validate';

// Router for /api/v1/contacts/:id
export const contactsRouter = Router();

contactsRouter.get(
  '/:id',
  validate({ params: contactParamSchema }),
  ContactsController.getById
);

contactsRouter.patch(
  '/:id',
  validate({ params: contactParamSchema, body: updateContactSchema }),
  ContactsController.update
);

contactsRouter.delete(
  '/:id',
  validate({ params: contactParamSchema }),
  ContactsController.delete
);

// Router for /api/v1/users/:userId/contacts
export const userContactsRouter = Router({ mergeParams: true });

userContactsRouter.get(
  '/',
  validate({ params: userParamSchema }),
  ContactsController.listForUser
);

userContactsRouter.post(
  '/',
  validate({ params: userParamSchema, body: createContactSchema }),
  ContactsController.createForUser
);
