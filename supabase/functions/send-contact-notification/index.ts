import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      throw new Error("Missing required fields");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get notification email from site_settings
    const { data: setting } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "notification_email")
      .single();

    const notificationEmail = setting?.value;
    if (!notificationEmail) {
      console.log("No notification email configured, skipping email send");
      return new Response(JSON.stringify({ success: true, email_sent: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email via Lovable API
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.log("No LOVABLE_API_KEY configured, skipping email send");
      return new Response(JSON.stringify({ success: true, email_sent: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");

    const emailResponse = await fetch(
      `https://api.lovable.dev/v1/projects/${projectRef}/email/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          to: notificationEmail,
          subject: `📸 Pesan Baru dari ${name}`,
          purpose: "transactional",
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px;">
              <div style="border-bottom: 2px solid #c9a96e; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">wArna<span style="color: #c9a96e;"> Studio</span></h1>
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Pesan Baru dari Website</p>
              </div>
              
              <div style="margin-bottom: 24px;">
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Nama</p>
                <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${name}</p>
              </div>
              
              <div style="margin-bottom: 24px;">
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Email</p>
                <p style="color: #1a1a1a; font-size: 16px; margin: 0;"><a href="mailto:${email}" style="color: #c9a96e; text-decoration: none;">${email}</a></p>
              </div>
              
              <div style="margin-bottom: 24px;">
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Pesan</p>
                <div style="background: #f9f9f7; border-left: 3px solid #c9a96e; padding: 16px; margin-top: 8px;">
                  <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #aaa; font-size: 12px; margin: 0;">Email ini dikirim otomatis dari form kontak website LENS.</p>
              </div>
            </div>
          `,
        }),
      }
    );

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send failed:", errorText);
      return new Response(JSON.stringify({ success: true, email_sent: false, email_error: errorText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, email_sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
