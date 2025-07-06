"use client"
import { useEffect } from "react";
import { signIn } from "next-auth/react";

const Page = () => {
  useEffect(() => {
    signIn("auth0", { callbackUrl: "/dashboard", connection: "admin-user"});
  }, []);

  return null;
};

export default Page;
