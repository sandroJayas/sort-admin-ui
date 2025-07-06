import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0Domain =
    process.env.AUTH0_ISSUER?.replace("https://", "").replace("/oauth2", "") ||
    "";
  const clientId = process.env.AUTH0_CLIENT_ID;

  // Auth0 will handle MFA enrollment automatically when the user logs in next time
  // We'll force a re-authentication with MFA enrollment
  const mfaUrl =
    `https://${auth0Domain}/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/auth/callback/auth0`)}&` +
    `scope=openid profile email offline_access&` +
    `prompt=login&` +
    `acr_values=http://schemas.openid.net/pape/policies/2007/06/multi-factor`;

  // In production, you'd also want to:
  // 1. Store in your database that the user wants MFA enabled
  // 2. Use Auth0 Management API to enforce MFA for this user

  return NextResponse.json({ mfaUrl });
}
