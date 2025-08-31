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