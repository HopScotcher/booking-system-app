// //app/admin/private/page.tsx

import { redirect } from "next/navigation";

import { createClient } from "../../../../lib/supabase/server";

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("../../error");
  }
  return (
    <div className="h-screen p-3">
      <p>Hello {data.user.email}</p>
    </div>
  );
}
