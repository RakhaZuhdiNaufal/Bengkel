import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  // Ambil parameter filter opsional
  const kategori = searchParams.get("kategori");
  const merk = searchParams.get("merk");
  const search = searchParams.get("search");

  let query = supabase.from("spareparts").select("*");

  if (kategori) {
    query = query.eq("kategori", kategori);
  }
  if (merk) {
    query = query.eq("merk", merk);
  }
  if (search) {
    query = query.or(`nama.ilike.%${search}%,sku.ilike.%${search}%,tipe_model.ilike.%${search}%`);
  }

  // Urutkan berdasarkan kategori dan nama
  query = query.order("kategori", { ascending: true }).order("nama", { ascending: true });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    count: data.length,
    data: data,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const body = await request.json();
    
    // Validasi basic (bisa dikembangkan dengan Zod)
    if (!body.nama || !body.kategori || body.harga_modal === undefined || body.harga_jual === undefined) {
      return NextResponse.json(
        { error: "Field nama, kategori, harga_modal, dan harga_jual wajib diisi." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("spareparts")
      .insert([
        {
          sku: body.sku || null,
          nama: body.nama,
          kategori: body.kategori,
          merk: body.merk || null,
          tipe_model: body.tipe_model || null,
          harga_modal: body.harga_modal,
          harga_jual: body.harga_jual,
          stok: body.stok || 0,
          satuan: body.satuan || "Pcs",
          kompatibilitas: body.kompatibilitas || [],
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Sparepart berhasil ditambahkan",
      data: data,
    }, { status: 201 });
    
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }
}
