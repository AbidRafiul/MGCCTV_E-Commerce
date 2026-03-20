import { redirect } from "next/navigation";

// Dashboard sudah dipindahkan ke /admin (admin/page.js)
export default function BerandaRedirect() {
  redirect("/admin");
}
