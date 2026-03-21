const { body, query } = require('express-validator');

const createPlantValidator = [
  body('plant_name').notEmpty().withMessage('Plant name is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('species').optional().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 2000 }),
  body('address').optional().isLength({ max: 500 }),
  body('planted_date').optional().isISO8601().toDate(),
];

const updatePlantValidator = [
  body('plant_name').optional().isLength({ min: 1, max: 200 }),
  body('species').optional().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 2000 }),
  body('address').optional().isLength({ max: 500 }),
];

const nearbyQueryValidator = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isInt({ min: 100, max: 100000 }).withMessage('Radius 100-100000 meters'),
];

module.exports = { createPlantValidator, updatePlantValidator, nearbyQueryValidator };
