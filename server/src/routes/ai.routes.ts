import { Router } from 'express';
import { AiController, askAiSchema } from '../controllers/ai.controller';
import { validate } from '../middleware/validate';

export const aiRouter = Router();

aiRouter.post(
  '/ask',
  validate({ body: askAiSchema }),
  AiController.ask
);
