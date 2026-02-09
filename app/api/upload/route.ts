import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase-auth-client";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 5MB limit" },
      { status: 400 }
    );
  }

  const bucketName =
    process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "uploads";

  const ext = file.name.split(".").pop();
  const path = `public/${Date.now()}.${ext}`;

  const { data, error } = await supabase()
    .storage
    .from(bucketName)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase()
    .storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return NextResponse.json({
    url: urlData.publicUrl,
    name: file.name,
    size: file.size,
  });
}
