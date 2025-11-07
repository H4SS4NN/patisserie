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
  body('category').optional().trim().isLength({ min: 1, max: 100 }),
  body('price').isInt({ min: 0 }).withMessage('Price must be a positive integer'),
  body('options').optional().isObject(),
  body('image_url').optional().isURL().withMessage('Valid image URL required'),
  body('available').optional().isBoolean(),
  body('flavors').optional().isArray(),
  body('flavors.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Flavor name required'),
  body('flavors.*.price_modifier')
    .optional()
    .isInt({ min: -100000, max: 100000 })
    .withMessage('Flavor price modifier must be an integer')
    .toInt(),
];

export const createFlavorValidation = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Flavor name required'),
  body('price_modifier')
    .optional()
    .isInt({ min: -100000, max: 100000 })
    .withMessage('Flavor price modifier must be an integer')
    .toInt(),
];

export const updateFlavorValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Flavor name required'),
  body('price_modifier')
    .optional()
    .isInt({ min: -100000, max: 100000 })
    .withMessage('Flavor price modifier must be an integer')
    .toInt(),
];

const isPlainObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

function validateJsonField(field: string) {
  return body(field)
    .optional()
    .custom((value) => {
      if (!isPlainObject(value)) {
        throw new Error(`${field} must be an object`);
      }
      return true;
    });
}

export const createPageContentValidation = [
  body('slug')
    .trim()
    .isLength({ min: 1, max: 150 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must be lowercase alphanumeric with dashes'),
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Page title required'),
  body('description').optional().trim().isLength({ max: 5000 }),
  validateJsonField('content'),
  validateJsonField('metadata'),
];

export const updatePageContentValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Page title required'),
  body('description').optional().trim().isLength({ max: 5000 }),
  validateJsonField('content'),
  validateJsonField('metadata'),
];

