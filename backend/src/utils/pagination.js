/**
 * Pagination helper — parses query params and returns offset/limit.
 * Usage: const { page, limit, offset } = parsePagination(req.query);
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = { parsePagination };
