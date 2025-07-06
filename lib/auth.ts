import Auth0Provider from "next-auth/providers/auth0";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
      authorization: {
        params: {
          scope: "openid profile email offline_access",
          audience: process.env.AUTH0_AUDIENCE,
        },
      },
      wellKnown: `${process.env.AUTH0_ISSUER}/.well-known/openid-configuration`,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "auth0") {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.sub = account.providerAccountId;
      }

      // Always return the token with existing accessToken
      return token;
    },
    async session({ session, token }) {
      session.user.sub = token.sub;
      session.accessToken = token.accessToken;
      session.idToken = token.idToken as string;
      return session;
    },
  },
};
