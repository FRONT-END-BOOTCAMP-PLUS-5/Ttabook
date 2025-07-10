import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./supabase";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const createClient = () =>
  createBrowserClient<Database>(
    supabaseUrl!,
    supabaseServiceKey!,
  );
