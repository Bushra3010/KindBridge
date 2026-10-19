import { redirect } from "next/navigation";

// Membership is approved automatically now; old links land in the app.
export default function Pending() {
  redirect("/home");
}
