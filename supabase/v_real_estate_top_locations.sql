-- View to aggregate real estate data by location for insight cards
-- Calculates average price and count, ordered by most listed locations.

CREATE OR REPLACE VIEW v_real_estate_top_locations AS
WITH location_stats AS (
    SELECT 
        location,
        AVG(CAST(price AS NUMERIC)) as avg_price,
        COUNT(*) as property_count
    FROM "Real_estate"
    WHERE price IS NOT NULL AND price > 0
    GROUP BY location
)
SELECT 
    location,
    ROUND(avg_price) as avg_price,
    property_count as count
FROM location_stats
ORDER BY property_count DESC
LIMIT 3;
