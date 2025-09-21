import { Button } from "@/components/ui/button";
import { signOut } from "../../../../actions/auth";

export default function SignOUt() {
  return (
    <div>
      <Button onClick={signOut}>Sign out</Button>
    </div>
  );
}
