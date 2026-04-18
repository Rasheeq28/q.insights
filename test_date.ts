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

  const { data, error } = await supabase.from("dsex_prices").select("*").limit(2);
  
  if (error) {
     console.error("DB Error", error);
     return;
  }
  
  console.log("RAW DB DATA:");
  console.log(data);

  const rows = data.map((item: any) => {
    const flatItem = { ...item };
    
    // Fix Excel numeric date formatting
    if (flatItem.date !== undefined && flatItem.date !== null) {
      console.log("Raw date:", flatItem.date, "Type:", typeof flatItem.date);
      const numDate = Number(flatItem.date);
      if (!isNaN(numDate) && numDate > 20000 && numDate < 100000) {
        const date = new Date(Math.round((numDate - 25569) * 86400 * 1000));
        flatItem.date = date.toISOString().split("T")[0];
      }
    }
    
    return flatItem;
  });

  console.log("\nTRANSFORMED DATA:");
  console.log(rows);
}
run();
