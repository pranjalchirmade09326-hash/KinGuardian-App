import { Router } from 'express';
import { usersRouter } from './users.routes';
import { contactsRouter } from './contacts.routes';
import { alertsRouter } from './alerts.routes';
import { aiRouter } from './ai.routes';

export const apiV1Router = Router();

apiV1Router.use('/users', usersRouter);
apiV1Router.use('/contacts', contactsRouter);
apiV1Router.use('/alerts', alertsRouter);
apiV1Router.use('/ai', aiRouter);
