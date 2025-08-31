import { supabase } from "../lib/supabase";


// ini function untuk melakukan login admin ya coy
export async function login(email, password) {
    const {data, error} = await supabase.auth.signInWithPassword({
        email, password
    });

    if (error) {
        throw error;
    }

    return data;
}

// buat logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}