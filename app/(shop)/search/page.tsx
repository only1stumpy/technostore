import { redirect } from 'next/navigation';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; search?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || params.search;

  redirect(query ? `/catalog?search=${encodeURIComponent(query)}` : '/catalog');
}
