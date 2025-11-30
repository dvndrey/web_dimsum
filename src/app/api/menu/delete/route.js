import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { id } = await req.json();

    // Step 1: Get the product data including images
    const { data: product, error: getError } = await supabaseAdmin
      .from('produk')
      .select('url_gambar')
      .eq('id_produk', id)
      .single();
    
    if (getError) throw getError;
    if (!product) throw new Error('Produk tidak ditemukan');

    // Step 2: Delete related records first
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

    // Step 3: Delete the product
    const { error: deleteError } = await supabaseAdmin
      .from('produk')
      .delete()
      .eq('id_produk', id);
    if (deleteError) throw deleteError;

    // Step 4: Clean up images from storage (if any)
    if (product?.url_gambar?.length > 0) {
      const fileNames = product.url_gambar
        .map(url => {
          // Extract filename from URL - handle different URL formats
          try {
            const urlObj = new URL(url);
            // Path will be something like '/storage/v1/object/public/gambar_menu/filename.jpg'
            const pathParts = urlObj.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            return fileName;
          } catch (e) {
            // If URL parsing fails, try simple extraction
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
          // Don't throw error here, as product is already deleted
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Error in delete product API:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500 }
    );
  }
}