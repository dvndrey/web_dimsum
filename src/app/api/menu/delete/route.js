import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { id } = await req.json();

    // ambil menu dulu
    const { data: menu, error: getError } = await supabaseAdmin
      .from('produk')
      .select('url_gambar')
      .eq('id_produk', id)
      .single();
    if (getError) throw getError;

    // hapus file di storage
    if (menu?.url_gambar?.length) {
      const fileNames = menu.url_gambar.map(url =>
        url.split('/object/public/gambar_menu/')[1]
      );
      const { error: removeError } = await supabaseAdmin.storage
        .from('gambar_menu')
        .remove(fileNames);
      if (removeError) throw removeError;
    }

    // hapus record di tabel
    const { data, error } = await supabaseAdmin
      .from('produk')
      .delete()
      .eq('id_produk', id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message || JSON.stringify(err) }),
      { status: 500 }
    );
  }
}
