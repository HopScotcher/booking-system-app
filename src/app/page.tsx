 "use client"

import { GetBiz } from "@/hooks/getBiz";
import { Button } from "@/components/ui/button";

export default function Home(){

  async function handleBiz(){
    const data = await GetBiz()
    console.log(data?.id)

  }

  return(
    <div>
      <Button onClick={handleBiz}>
      Get Biz Info
      </Button>
    </div>
  )
}