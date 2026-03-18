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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    if (!roleCheck) throw new Error("Not an admin");

    let body;
    try {
      body = await req.json();
    } catch {
      throw new Error("Invalid JSON body");
    }
    const { action, ...params } = body;

    if (action === "list_users") {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;

      // Get profiles and roles
      const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
      const { data: roles } = await supabaseAdmin.from("user_roles").select("*");

      const enriched = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: profiles?.find((p: any) => p.id === u.id)?.full_name || "",
        roles: roles?.filter((r: any) => r.user_id === u.id).map((r: any) => r.role) || [],
        created_at: u.created_at,
      }));

      return new Response(JSON.stringify(enriched), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_profile") {
      const { user_id, full_name } = params;
      const targetId = user_id || user.id;
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ full_name, updated_at: new Date().toISOString() })
        .eq("id", targetId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_password") {
      const { user_id, new_password } = params;
      const targetId = user_id || user.id;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(targetId, { password: new_password });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "add_role") {
      const { user_id, role } = params;
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id, role });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "remove_role") {
      const { user_id, role } = params;
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create_user") {
      const { email, password, full_name, role } = params;
      const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (error) throw error;

      // Create profile
      await supabaseAdmin.from("profiles").upsert({ id: newUser.user.id, full_name: full_name || "" });

      // Add role
      if (role) {
        await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role });
      }

      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete_user") {
      const { user_id } = params;
      if (user_id === user.id) throw new Error("Cannot delete yourself");
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Unknown action");
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
