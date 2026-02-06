import { Dataset } from "@/lib/types";

export const MOCK_DATASETS: Dataset[] = [
    {
        id: "1",
        slug: "dsex-prices-historical",
        title: "DSEX Historical Stock Prices",
        description: "Daily historical stock prices for all companies listed on the Dhaka Stock Exchange (DSEX). Includes open, high, low, close, and volume data. Connected to live Supabase database.",
        price: 49,
        updatedAt: "Live",
        source: "Dhaka Stock Exchange",
        tags: ["Finance", "Stock Market", "Bangladesh"],
        fields: ["trading_code", "sector", "date", "openp", "high", "low", "closep", "volume"],
        previewData: []
    }
];
