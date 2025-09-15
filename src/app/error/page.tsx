//app/error/page.tsx

"use client";

import { TriangleAlertIcon } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="h-screen flex  flex-col justify-center items-center ">
    

      <TriangleAlertIcon className="text-2xl" size={42} color="red"/>
      <p className="text-red-500 text-2xl">Sorry, something went wrong</p>

    </div>
  );
}
