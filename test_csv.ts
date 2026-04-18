import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Parse .env.local manually
const envPath = ".env.local";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length > 0) {
      process.env[key.trim()] = val.join("=").trim().replace(/"/g, "");
    }
  });
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.from("dsex_prices")
    .select(`*, mapper:dsex_mapper!inner(trading_code, sector, category)`)
    .order("date", { ascending: false })
    .limit(10);
  
  if (error) {
     console.error("DB Error", error);
     return;
  }
  
  const rows = data.map((item: any) => {
    const flatItem = { ...item };
    if (flatItem.mapper) {
      const mapper = Array.isArray(flatItem.mapper) ? flatItem.mapper[0] : flatItem.mapper;
      flatItem.trading_code = mapper?.trading_code ?? "";
      flatItem.sector = mapper?.sector ?? "";
      flatItem.category = mapper?.category ?? "";
      delete flatItem.mapper;
    }
    
    // Fix Excel numeric date formatting (e.g., 46121 -> "2026-04-10")
    if (flatItem.date !== undefined && flatItem.date !== null) {
      const numDate = Number(flatItem.date);
      if (!isNaN(numDate) && numDate > 20000 && numDate < 100000) {
        // Excel stores dates as days since 1900-01-01. 25569 is offset to 1970-01-01 (UNIX epoch).
        const date = new Date(Math.round((numDate - 25569) * 86400 * 1000));
        flatItem.date = date.toISOString().split("T")[0];
      }
    }

    // Remove internal database IDs
    delete flatItem.id;
    delete flatItem.mapper_id;
    
    return flatItem;
  });

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row: any) => 
      headers.map(fieldName => {
        const value = row[fieldName] ?? "";
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    )
  ].join("\n");

  console.log("CSV OUTPUT:");
  console.log(csvContent);
}
run();
