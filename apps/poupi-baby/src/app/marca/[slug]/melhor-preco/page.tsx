import type { Metadata } from 'next';
import { ProgrammaticSeoPage } from '@/components/seo/ProgrammaticSeoPage';
import { assertSeoPayload, fetchSeoPayload, metadataFromPayload } from '@/app/programmatic-seo-helpers';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataFromPayload(await fetchSeoPayload(`/seo/pages/brand/${slug}/melhor-preco`), 'Melhor preço por marca | Nuvii Baby');
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const payload = assertSeoPayload(await fetchSeoPayload(`/seo/pages/brand/${slug}/melhor-preco`), `/marca/${slug}/melhor-preco`);
  return <ProgrammaticSeoPage payload={payload} breadcrumb={[{ label: 'Nuvii Baby', href: '/' }, { label: payload.title }]} />;
}
