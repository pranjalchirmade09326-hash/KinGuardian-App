import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AlertModel } from '../models/alert.model';
import { UserModel } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';

export const createAlertSchema = z.object({
  userId: z.string().uuid('Invalid user UUID format'),
  type: z.enum([
    'fall_detected',
    'fall_detection',
    'sos',
    'sos_panic',
    'vital_spike',
    'bp_spike',
    'unwell_checkin',
    'heart_rate_abnormal',
    'medication_missed',
    'geofence_exit',
    'general_emergency',
  ]),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('medium'),
  description: z.string().min(1, 'Description is required'),
  location_coords: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
    })
    .optional()
    .nullable(),
  location_name: z.string().max(255).optional().nullable(),
  metadata: z.record(z.any()).optional().default({}),
  status: z
    .enum(['triggered', 'acknowledged', 'dispatched', 'resolved', 'false_alarm'])
    .optional()
    .default('triggered'),
});

export const acknowledgeAlertSchema = z.object({
  acknowledged_by: z.string().min(1, 'acknowledged_by is required'),
});

export const resolveAlertSchema = z.object({
  resolution_notes: z.string().min(1, 'resolution_notes is required'),
});

export const alertIdParamSchema = z.object({
  id: z.string().uuid('Invalid alert UUID format'),
});

export const listAlertsQuerySchema = z.object({
  userId: z.string().uuid('Invalid user UUID format').optional(),
  status: z
    .enum(['triggered', 'acknowledged', 'dispatched', 'resolved', 'false_alarm'])
    .optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export class AlertsController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserModel.findById(req.body.userId);
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', `User with ID ${req.body.userId} not found.`);
      }

      const alert = await AlertModel.create(req.body);
      res.status(201).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, status, severity, limit, offset } = req.query as any;
      const { alerts, total } = await AlertModel.list({
        userId,
        status,
        severity,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: alerts,
        count: total,
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

      const { status, severity, limit, offset } = req.query as any;
      const { alerts, total } = await AlertModel.list({
        userId: req.params.userId,
        status,
        severity,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: alerts,
        count: total,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await AlertModel.findById(req.params.id);
      if (!alert) {
        throw new AppError(404, 'NOT_FOUND', `Alert with ID ${req.params.id} not found.`);
      }

      res.status(200).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  static async acknowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await AlertModel.findById(req.params.id);
      if (!alert) {
        throw new AppError(404, 'NOT_FOUND', `Alert with ID ${req.params.id} not found.`);
      }

      const updated = await AlertModel.acknowledge(req.params.id, req.body.acknowledged_by);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await AlertModel.findById(req.params.id);
      if (!alert) {
        throw new AppError(404, 'NOT_FOUND', `Alert with ID ${req.params.id} not found.`);
      }

      const updated = await AlertModel.resolve(req.params.id, req.body.resolution_notes);
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
      const alert = await AlertModel.findById(req.params.id);
      if (!alert) {
        throw new AppError(404, 'NOT_FOUND', `Alert with ID ${req.params.id} not found.`);
      }

      await AlertModel.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
