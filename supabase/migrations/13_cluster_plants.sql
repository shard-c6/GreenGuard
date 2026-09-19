CREATE OR REPLACE FUNCTION cluster_plants(
  zoom_level INTEGER,
  bbox_min_lng FLOAT DEFAULT -180,
  bbox_min_lat FLOAT DEFAULT -90,
  bbox_max_lng FLOAT DEFAULT 180,
  bbox_max_lat FLOAT DEFAULT 90
)
RETURNS TABLE (
  cluster_id TEXT,
  centroid_lng FLOAT,
  centroid_lat FLOAT,
  plant_count BIGINT,
  plant_ids UUID[]
)
LANGUAGE SQL STABLE AS $$
  SELECT
    CASE
      WHEN zoom_level <= 5 THEN
        -- Aggressive grid snapping at low zoom
        ST_AsText(ST_SnapToGrid(location::geometry, 5.0))
      WHEN zoom_level <= 10 THEN
        ST_AsText(ST_SnapToGrid(location::geometry, 1.0))
      ELSE
        ST_AsText(ST_SnapToGrid(location::geometry, 0.1))
    END AS cluster_id,
    AVG(ST_X(location::geometry)) AS centroid_lng,
    AVG(ST_Y(location::geometry)) AS centroid_lat,
    COUNT(*) AS plant_count,
    ARRAY_AGG(id) AS plant_ids
  FROM plants
  WHERE
    location IS NOT NULL
    AND adoption_status = 'available'
    AND ST_Within(
      location::geometry,
      ST_MakeEnvelope(bbox_min_lng, bbox_min_lat, bbox_max_lng, bbox_max_lat, 4326)
    )
  GROUP BY cluster_id
  ORDER BY plant_count DESC
  LIMIT 200;
$$;
