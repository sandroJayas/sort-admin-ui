// app/api/auth/logout/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.idToken) {
    return NextResponse.json({ error: "No session found" }, { status: 401 });
  }

  // Extract Auth0 domain from issuer URL
  const auth0Domain =
    process.env.AUTH0_ISSUER?.replace("https://", "").replace("/oauth2", "") ||
    "";

  // Use NEXTAUTH_URL for the return URL
  const returnTo = encodeURIComponent(
    process.env.NEXTAUTH_URL || "https://www.sortstorage.com/",
  );

  // Construct Auth0 logout URL
  const logoutUrl =
    `https://${auth0Domain}/v2/logout?` +
    `client_id=${process.env.AUTH0_CLIENT_ID}&` +
    `returnTo=${returnTo}`;

  return NextResponse.json({ logoutUrl });
}
