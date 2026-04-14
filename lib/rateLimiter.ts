import { createClient } from "@supabase/supabase-js";

const FREE_TIER_DAILY_LIMIT = 100;

/**
 * Check if a user has exceeded their daily API rate limit.
 * Increments the usage counter on each call.
 * Returns { allowed: true } or { allowed: false, used: number, limit: number }
 */
export async function checkAndIncrementUsage(
  userId: string,
  datasetSlug: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Try to get existing usage row for today
  const { data: existing, error: fetchError } = await supabase
    .from("api_usage")
    .select("id, request_count, last_request_at")
    .eq("user_id", userId)
    .eq("dataset_slug", datasetSlug)
    .maybeSingle();

  if (fetchError) {
    console.error("[RateLimit] Fetch error:", fetchError.message);
    // Fail open — don't block user if tracking fails
    return { allowed: true, used: 0, limit: FREE_TIER_DAILY_LIMIT };
  }

  if (!existing) {
    // First request ever — insert row
    const { error: insertError } = await supabase.from("api_usage").insert({
      user_id: userId,
      dataset_slug: datasetSlug,
      request_count: 1,
      last_request_at: new Date().toISOString(),
    });

    if (insertError) console.error("[RateLimit] Insert error:", insertError.message);
    return { allowed: true, used: 1, limit: FREE_TIER_DAILY_LIMIT };
  }

  // Check if last request was today
  const lastDate = existing.last_request_at?.split("T")[0];
  const isToday = lastDate === today;

  if (!isToday) {
    // New day — reset counter
    await supabase
      .from("api_usage")
      .update({ request_count: 1, last_request_at: new Date().toISOString() })
      .eq("id", existing.id);

    return { allowed: true, used: 1, limit: FREE_TIER_DAILY_LIMIT };
  }

  const currentCount = existing.request_count ?? 0;

  if (currentCount >= FREE_TIER_DAILY_LIMIT) {
    return { allowed: false, used: currentCount, limit: FREE_TIER_DAILY_LIMIT };
  }

  // Increment counter
  await supabase
    .from("api_usage")
    .update({
      request_count: currentCount + 1,
      last_request_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  return { allowed: true, used: currentCount + 1, limit: FREE_TIER_DAILY_LIMIT };
}
