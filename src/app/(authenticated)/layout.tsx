import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/jwt";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthProvider
      initialUser={{
        uid: session.uid,
        email: session.email,
        role: session.role,
      }}
    >
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
