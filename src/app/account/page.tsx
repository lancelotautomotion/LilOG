import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mon compte — Lil'OG" };

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const name = session.user?.name ?? session.user?.email ?? "Cliente";
  const email = session.user?.email ?? "";

  return (
    <main className="auth-page">
      <a className="auth-back" href="/">← Retour</a>
      <div className="auth-brand">Lil&#39;OG</div>
      <h1 className="auth-title">Bonjour, {name.split(" ")[0]} 👋</h1>

      <div className="auth-card">
        <div className="account-info">
          <div className="account-row">
            <span className="account-label">Email</span>
            <span className="account-value">{email}</span>
          </div>
          <div className="account-row">
            <span className="account-label">Nom</span>
            <span className="account-value">{name}</span>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="auth-submit auth-signout" type="submit">
            Se déconnecter
          </button>
        </form>
      </div>
    </main>
  );
}
