import Layout from '@/components/Layout';
import NewsDetailClient from '@/components/pages/NewsDetailClient';

interface PageProps {
  params: Promise<{
    id: string; // This is actually a slug
  }>;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Layout>
      <NewsDetailClient slug={id} />
    </Layout>
  );
}
