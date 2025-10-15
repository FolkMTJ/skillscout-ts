// src/types/next.ts
// Helper types for Next.js 15 async params

export type PageProps<T = Record<string, string>> = {
  params: Promise<T>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export type LayoutProps<T = Record<string, string>> = {
  params: Promise<T>;
  children: React.ReactNode;
};

export type RouteContext<T = Record<string, string>> = {
  params: Promise<T>;
};
