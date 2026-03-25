import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbz8yTdoO6X-QOBEDyA4-2PYh_e_-G4pJsJQOfMnrAY8L0MfTJ_D2t63m1v6qCBo3a6x/exec";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch ALL orders from GAS (no search param = returns all)
    const gasRes = await fetch(GAS_URL);
    if (!gasRes.ok) {
      throw new Error(`GAS returned ${gasRes.status}`);
    }
    const orders: Record<string, unknown>[] = await gasRes.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "No orders from GAS" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map GAS fields to DB columns
    const rows = orders.map((o: Record<string, unknown>) => ({
      package_note: (o["包裝備註"] as string) || null,
      model: (o["款式"] as string) || null,
      door_window: (o["門/窗"] as string) || null,
      frame_color: (o["框色"] as string) || null,
      fabric_color: (o["網材"] as string) || null,
      location: (o["位置"] as string) || null,
      width_mm: typeof o["寬(mm)"] === "number" ? o["寬(mm)"] : null,
      height_mm: typeof o["高(mm)"] === "number" ? o["高(mm)"] : null,
      pull_type: (o["單拉/對拉"] as string) || null,
      install_type: (o["內安/外安"] as string) || null,
      frame_type: (o["四框/三框"] as string) || null,
    }));

    // Clear existing orders and insert fresh data
    // Using delete + insert for simplicity (full refresh)
    const { error: deleteError } = await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError.message}`);
    }

    // Insert in batches of 500
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error: insertError } = await supabase.from("orders").insert(batch);
      if (insertError) {
        throw new Error(`Insert batch ${i} failed: ${insertError.message}`);
      }
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({ synced: inserted, total: orders.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
