import { supabase } from "../lib/supabase";

// fungsi buat upload gambar ke penyimpanan database kita, disini ambil url nya doang buat disimpen ke tabel menu
export async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;

    const {data, error} = await supabase.storage.from("gambar_menu").upload(fileName, file);

    if (error) {
        throw error;
    }

    const {data: { publicUrl }} = supabase.storage.from("gambar_menu").getPublicUrl(fileName);
    return publicUrl;
}

// fungsi buat hapus gambar dari storage
export async function deleteImages(urls) {
    if (!urls || urls.length === 0) return;

    const fileNames = urls
        .map(url => {
            try {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/');
                return pathParts[pathParts.length - 1];
            } catch (e) {
                const parts = url.split('/');
                return parts[parts.length - 1];
            }
        })
        .filter(Boolean);

    if (fileNames.length > 0) {
        const { error } = await supabase.storage
            .from('gambar_menu')
            .remove(fileNames);
        
        if (error) {
            console.error('Error deleting images:', error);
            throw error;
        }
    }
}