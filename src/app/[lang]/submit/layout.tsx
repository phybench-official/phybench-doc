import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;

  return <HomeLayout 
    {...baseOptions(lang)}
    links={[
      {
        type: "main",
        on: 'all',
        text: "文档",
        url: "/docs/doc",
      },
      {
        type: "main",
        on: 'all',
        text: "API接口文档",
        url: "/docs/openapi",
      },
    ]}
  >
    {children}
  </HomeLayout>;
}