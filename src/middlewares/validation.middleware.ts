import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
    } else {
      res.status(400).json({ errors: errors.array() });
    }
  };
};

export const createOrderValidation = [
  body('client_name').trim().isLength({ min: 2, max: 255 }).withMessage('Client name required'),
  body('client_phone')
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid phone number required'),
  body('client_email').optional().isEmail().withMessage('Valid email required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.product_id').isUUID().withMessage('Valid product ID required'),
  body('items.*.name').trim().isLength({ min: 1 }).withMessage('Item name required'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isInt({ min: 0 }).withMessage('Price must be a positive integer'),
  body('pickup_or_delivery_date').isISO8601().withMessage('Valid date required'),
  body('payment_method').isIn(['CASH', 'PAYPAL']).withMessage('Valid payment method required'),
  body('notes').optional().trim(),
];

export const loginValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const updateOrderStatusValidation = [
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'EN_PREPARATION', 'EN_CUISSON', 'PRETE', 'LIVREE', 'CANCELLED'])
    .withMessage('Valid status required'),
  body('notes').optional().trim(),
];

export const updatePaymentStatusValidation = [
  body('payment_status')
    .isIn(['PENDING', 'PAID', 'REFUNDED'])
    .withMessage('Valid payment status required'),
  body('paypal_payment_id').optional().trim(),
];

export const createProductValidation = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Product name required'),
  body('description').optional().trim(),
  body('price').isInt({ min: 0 }).withMessage('Price must be a positive integer'),
  body('options').optional().isObject(),
  body('image_url').optional().isURL().withMessage('Valid image URL required'),
  body('available').optional().isBoolean(),
];

