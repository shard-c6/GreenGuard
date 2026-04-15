/**
 * Standardized API response helpers.
 * Every endpoint should use these for consistency.
 */

function success(res, data, meta = null, statusCode = 200) {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

function created(res, data) {
  return success(res, data, null, 201);
}

function paginated(res, data, { page, limit, total }) {
  return success(res, data, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

function error(res, message, statusCode = 400, code = 'BAD_REQUEST') {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

function notFound(res, message = 'Resource not found') {
  return error(res, message, 404, 'NOT_FOUND');
}

function unauthorized(res, message = 'Unauthorized') {
  return error(res, message, 401, 'UNAUTHORIZED');
}

function forbidden(res, message = 'Forbidden') {
  return error(res, message, 403, 'FORBIDDEN');
}

function serverError(res, message = 'Internal server error') {
  return error(res, message, 500, 'INTERNAL_ERROR');
}

module.exports = { success, created, paginated, error, notFound, unauthorized, forbidden, serverError };
