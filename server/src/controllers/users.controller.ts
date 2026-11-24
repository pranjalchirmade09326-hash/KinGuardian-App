import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserModel } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50).optional().nullable(),
  role: z.enum(['coordinator', 'parent', 'caregiver', 'doctor']).default('parent'),
  blood_group: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'])
    .optional()
    .nullable(),
  medical_conditions: z.array(z.any()).optional().default([]),
  allergies: z.array(z.any()).optional().default([]),
  address: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  emergency_notes: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user UUID format'),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(['coordinator', 'parent', 'caregiver', 'doctor']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export class UsersController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await UserModel.findByEmail(req.body.email);
      if (existing) {
        throw new AppError(409, 'CONFLICT', 'A user with this email already exists.');
      }

      const user = await UserModel.create(req.body);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', `User with ID ${req.params.id} not found.`);
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, limit, offset } = req.query as any;
      const { users, total } = await UserModel.list({ role, limit, offset });

      res.status(200).json({
        success: true,
        data: users,
        count: total,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await UserModel.findById(req.params.id);
      if (!existing) {
        throw new AppError(404, 'NOT_FOUND', `User with ID ${req.params.id} not found.`);
      }

      if (req.body.email && req.body.email !== existing.email) {
        const emailUser = await UserModel.findByEmail(req.body.email);
        if (emailUser) {
          throw new AppError(409, 'CONFLICT', 'Another user with this email already exists.');
        }
      }

      const updated = await UserModel.update(req.params.id, req.body);
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
      const existing = await UserModel.findById(req.params.id);
      if (!existing) {
        throw new AppError(404, 'NOT_FOUND', `User with ID ${req.params.id} not found.`);
      }

      await UserModel.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
