"use server";

import { supabase } from "@/lib/supabase/supabase-auth-client";

export async function createPdfNote({
  userId,
  fileUrl,
  fileName,
  fileSize,
}: {
  userId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}) {
  const { data, error } = await supabase()
    .from("pdf_notes")
    .insert({
      user_id: userId,
      title: fileName,
      file_name: fileName,
      file_size: fileSize,
      file_url: fileUrl,
      is_processed: false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
