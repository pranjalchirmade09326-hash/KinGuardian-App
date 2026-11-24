import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ContactModel } from '../models/contact.model';
import { UserModel } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  relationship: z.string().min(1, 'Relationship is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(50),
  email: z.string().email('Invalid email address').optional().nullable(),
  is_primary: z.boolean().optional().default(false),
  priority: z.coerce.number().int().min(0).optional().default(1),
});

export const updateContactSchema = createContactSchema.partial();

export const userParamSchema = z.object({
  userId: z.string().uuid('Invalid user UUID format'),
});

export const contactParamSchema = z.object({
  id: z.string().uuid('Invalid contact UUID format'),
});

export class ContactsController {
  static async createForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserModel.findById(req.params.userId);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', `User with ID ${req.params.userId} not found.`);
      }

      const contact = await ContactModel.create(req.params.userId, req.body);
      res.status(201).json({
        success: true,
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserModel.findById(req.params.userId);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', `User with ID ${req.params.userId} not found.`);
      }

      const contacts = await ContactModel.listByUserId(req.params.userId);
      res.status(200).json({
        success: true,
        data: contacts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contact = await ContactModel.findById(req.params.id);
      if (!contact) {
        throw new AppError(404, 'NOT_FOUND', `Contact with ID ${req.params.id} not found.`);
      }

      res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await ContactModel.findById(req.params.id);
      if (!existing) {
        throw new AppError(404, 'NOT_FOUND', `Contact with ID ${req.params.id} not found.`);
      }

      const updated = await ContactModel.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await ContactModel.findById(req.params.id);
      if (!existing) {
        throw new AppError(404, 'NOT_FOUND', `Contact with ID ${req.params.id} not found.`);
      }

      await ContactModel.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
