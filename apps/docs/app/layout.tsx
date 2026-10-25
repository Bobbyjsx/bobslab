import "@bobslab/ui/dist/output.css";
import "./globals.css";

import * as React from "react";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Logo } from "@bobslab/icons";
import { ProgressBar } from "@/components/ProgressBar";

export const metadata = {
  title: "Bobslab UI & Monorepo Docs",
  description:
    "Design system, Base UI primitives, composable Table, utilities, and React hooks",
};

const navbar = (
  <Navbar
    logo={
      <div className="flex items-center gap-2 font-bold text-base">
        <Logo size={24} />
        <span>Bobslab</span>
      </div>
    }
    projectLink="https://github.com/Bobbyjsx/bobslab"
  />
);

const footer = (
  <Footer>MIT {new Date().getFullYear()} © Bobslab UI Engineering.</Footer>
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <React.Suspense fallback={null}>
          <ProgressBar />
        </React.Suspense>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Bobbyjsx/bobslab"
          sidebar={{
            defaultOpen: true,
            autoCollapse: false,
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
