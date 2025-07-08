import React from "react";
import Dashboard from "@/components/kokonutui/dashboard";
import Layout from "@/components/kokonutui/layout";

const Page = () => {
  return (
    <Layout page={"dashboard"}>
      <Dashboard />
    </Layout>
  );
};

export default Page;
