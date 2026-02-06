import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MOCK_DATASETS } from "@/lib/mockData";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const sector = searchParams.get("sector");
    const tradingCode = searchParams.get("trading_code");
    const format = searchParams.get("format");
    const limit = 3; // Default limit for preview (Top 3 rows)

    // If specific DSEX dataset is requested or we are browsing and using filters relevant to it
    if (slug === "dsex-prices-historical" || (slug && slug.includes("dsex"))) {
        try {
            // META MODE: Fetch min/max dates
            if (searchParams.get("mode") === "meta") {
                const { data: minData, error: minError } = await supabase
                    .from("dsex_prices")
                    .select("date")
                    .order("date", { ascending: true })
                    .limit(1)
                    .single();

                const { data: maxData, error: maxError } = await supabase
                    .from("dsex_prices")
                    .select("date")
                    .order("date", { ascending: false })
                    .limit(1)
                    .single();

                if (minError || maxError) throw minError || maxError;

                return NextResponse.json({
                    minDate: minData?.date,
                    maxDate: maxData?.date
                });
            }

            // If exporting, use batched fetching to bypass limits
            if (format === "csv") {
                // SECURITY CHECK: Verify Auth Token
                const authHeader = request.headers.get("Authorization");
                if (!authHeader) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }
                const token = authHeader.replace("Bearer ", "");
                const { data: { user }, error: authError } = await supabase.auth.getUser(token);

                if (authError || !user) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                }

                const fieldsParam = searchParams.get("fields");
                const requestedFields = fieldsParam ? fieldsParam.split(",") : null;

                // Set headers for CSV download
                const headers = new Headers();
                headers.set("Content-Type", "text/csv");
                headers.set("Content-Disposition", `attachment; filename="dsex_prices_export.csv"`);

                // Create a readable stream for the response
                const stream = new ReadableStream({
                    async start(controller) {
                        const encoder = new TextEncoder();
                        const batchSize = 1000;
                        let offset = 0;
                        let hasMore = true;
                        let isFirstBatch = true;

                        // Helper to escape CSV fields
                        const escapeCsv = (str: any) => {
                            if (str === null || str === undefined) return '';
                            const stringValue = String(str);
                            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                                return `"${stringValue.replace(/"/g, '""')}"`;
                            }
                            return stringValue;
                        };

                        try {
                            while (hasMore) {
                                let batchQuery = supabase
                                    .from("dsex_prices")
                                    .select(`*, mapper:dsex_mapper!inner(trading_code, sector, category)`)
                                    .order("date", { ascending: false })
                                    .range(offset, offset + batchSize - 1);

                                // Apply Filters (Repeat logic)
                                if (sector) batchQuery = batchQuery.eq("mapper.sector", sector);
                                if (tradingCode) batchQuery = batchQuery.eq("mapper.trading_code", tradingCode);
                                const startDate = searchParams.get("startDate");
                                const endDate = searchParams.get("endDate");
                                if (startDate) batchQuery = batchQuery.gte("date", startDate);
                                if (endDate) batchQuery = batchQuery.lte("date", endDate);

                                const { data: batchData, error: batchError } = await batchQuery;

                                if (batchError) {
                                    controller.error(batchError);
                                    break;
                                }

                                if (!batchData || batchData.length === 0) {
                                    hasMore = false;
                                    break;
                                }

                                // Process batch
                                const flattenedBatch = batchData.map((item: any) => {
                                    const flat = {
                                        ...item,
                                        trading_code: item?.mapper?.trading_code,
                                        sector: item?.mapper?.sector,
                                        category: item?.mapper?.category,
                                    };
                                    delete flat.mapper;

                                    // Filter fields if requested
                                    if (requestedFields && requestedFields.length > 0) {
                                        const filtered: any = {};
                                        requestedFields.forEach(field => {
                                            if (Object.prototype.hasOwnProperty.call(flat, field)) {
                                                filtered[field] = flat[field];
                                            }
                                        });
                                        return filtered;
                                    }
                                    return flat;
                                });

                                // Write Header only once
                                if (isFirstBatch && flattenedBatch.length > 0) {
                                    const headerRow = Object.keys(flattenedBatch[0]).join(",") + "\n";
                                    controller.enqueue(encoder.encode(headerRow));
                                    isFirstBatch = false;
                                }

                                // Write Rows
                                const csvChunk = flattenedBatch.map((row: any) =>
                                    Object.values(row).map(escapeCsv).join(",")
                                ).join("\n") + "\n";

                                controller.enqueue(encoder.encode(csvChunk));

                                offset += batchSize;
                                // If we got fewer rows than requested, we are done
                                if (batchData.length < batchSize) {
                                    hasMore = false;
                                }
                            }
                            controller.close();
                        } catch (err) {
                            controller.error(err);
                        }
                    }
                });

                return new NextResponse(stream, { headers });

            } else {
                // Regular JSON Preview Logic with Limit
                let query = supabase
                    .from("dsex_prices")
                    .select(`*, mapper:dsex_mapper!inner(trading_code, sector, category)`)
                    .order("date", { ascending: false });

                if (sector) query = query.eq("mapper.sector", sector);
                if (tradingCode) query = query.eq("mapper.trading_code", tradingCode);
                const startDate = searchParams.get("startDate");
                const endDate = searchParams.get("endDate");
                if (startDate) query = query.gte("date", startDate);
                if (endDate) query = query.lte("date", endDate);

                query = query.limit(limit);

                const { data, error } = await query;
                if (error) throw error;

                const flattenedData = data.map((item: any) => ({
                    ...item,
                    trading_code: item?.mapper?.trading_code,
                    sector: item?.mapper?.sector,
                    category: item?.mapper?.category,
                    mapper: undefined
                }));

                return NextResponse.json(flattenedData);
            }

        } catch (error: any) {
            console.error("DSEX API Error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    // Fallback to Mock Data for other "datasets" or generic listing
    const dataset = MOCK_DATASETS.find((d) => d.slug === slug);
    if (dataset) {
        if (format === "csv") {
            // Stub for mock export
            return new NextResponse("mock,csv,data\n1,2,3", { headers: { "Content-Type": "text/csv" } });
        }
        // Return mock preview data if detail view
        return NextResponse.json(dataset.previewData);
    }

    // If no specific slug, return list of datasets (simplified)
    return NextResponse.json(MOCK_DATASETS.map(d => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        description: d.description,
        price: d.price,
        updatedAt: d.updatedAt,
        source: d.source,
        tags: d.tags
    })));
}
