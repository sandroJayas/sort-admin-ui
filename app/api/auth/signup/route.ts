import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const auth0Domain =
    process.env.AUTH0_ISSUER?.replace("https://", "").replace("/oauth2", "") ||
    "";
  const clientId = process.env.AUTH0_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    `https://www.sortstorage.com/api/auth/callback/auth0`,
  );

  // Construct Auth0 URL with signup hint and pre-filled email
  const auth0Url =
    `https://${auth0Domain}/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=openid profile email offline_access&` +
    `screen_hint=signup&` +
    `login_hint=${encodeURIComponent(email)}`;

  return NextResponse.json({ authUrl: auth0Url });
}
