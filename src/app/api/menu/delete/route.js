import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { id } = await req.json();

    // Step 1: Cek apakah produk ada di pesanan
    const { data: orderItems, error: checkError } = await supabaseAdmin
      .from('pesanan_item')
      .select('id_item')
      .eq('id_produk', id)
      .limit(1);

    if (checkError) throw checkError;

    // Step 2: Jika produk pernah dipesan, lakukan SOFT DELETE
    if (orderItems && orderItems.length > 0) {
      const { error: softDeleteError } = await supabaseAdmin
        .from('produk')
        .update({ 
          deleted_at: new Date().toISOString(),
          nama_produk: `[DIHAPUS] ${new Date().toLocaleDateString('id-ID')} - Produk sebelumnya: ${(await supabaseAdmin
            .from('produk')
            .select('nama_produk')
            .eq('id_produk', id)
            .single()).data?.nama_produk || 'Unknown'}`.substring(0, 100) // Batasi panjang nama
        })
        .eq('id_produk', id);

      if (softDeleteError) throw softDeleteError;

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Produk telah di-soft delete (masih ada data pesanan terkait)',
        type: 'soft_delete'
      }), { status: 200 });
    }

    // Step 3: Jika produk belum pernah dipesan, lakukan HARD DELETE
    // Get the product data including images
    const { data: product, error: getError } = await supabaseAdmin
      .from('produk')
      .select('url_gambar, nama_produk')
      .eq('id_produk', id)
      .single();
    
    if (getError) throw getError;
    if (!product) throw new Error('Produk tidak ditemukan');

    // Delete related records first
    const { error: addOnsError } = await supabaseAdmin
      .from('add_ons')
      .delete()
      .eq('id_produk', id);
    if (addOnsError) throw addOnsError;

    const { error: variantsError } = await supabaseAdmin
      .from('varian')
      .delete()
      .eq('id_produk', id);
    if (variantsError) throw variantsError;

    const { error: readyDatesError } = await supabaseAdmin
      .from('produk_ready_date')
      .delete()
      .eq('id_produk', id);
    if (readyDatesError) throw readyDatesError;

    // Delete the product
    const { error: deleteError } = await supabaseAdmin
      .from('produk')
      .delete()
      .eq('id_produk', id);
    if (deleteError) throw deleteError;

    // Clean up images from storage (if any)
    if (product?.url_gambar?.length > 0) {
      const fileNames = product.url_gambar
        .map(url => {
          try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            return fileName;
          } catch (e) {
            const parts = url.split('/');
            return parts[parts.length - 1];
          }
        })
        .filter(Boolean);

      if (fileNames.length > 0) {
        console.log('Deleting images from storage:', fileNames);
        const { error: removeError } = await supabaseAdmin.storage
          .from('gambar_menu')
          .remove(fileNames);
        
        if (removeError) {
          console.error('Error removing images from storage:', removeError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Produk berhasil dihapus permanen',
      type: 'hard_delete'
    }), { status: 200 });

  } catch (err) {
    console.error('Error in delete product API:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500 }
    );
  }
}