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

  console.log("Checking dates in dsex_prices...");
  for (const sort of [true, false]) {
    const { data, error } = await supabase.from("dsex_prices").select("date, closep").order("date", { ascending: sort }).limit(5);
    console.log(`Order Asc [${sort}]: `, data);
  }
}
run();
