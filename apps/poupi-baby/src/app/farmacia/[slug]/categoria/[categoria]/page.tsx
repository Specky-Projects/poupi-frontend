import type { Metadata } from 'next';
import { ProgrammaticSeoPage } from '@/components/seo/ProgrammaticSeoPage';
import { assertSeoPayload, fetchSeoPayload, metadataFromPayload } from '@/app/programmatic-seo-helpers';

type Props = { params: Promise<{ slug: string; categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, categoria } = await params;
  return metadataFromPayload(await fetchSeoPayload(`/seo/pages/marketplaces/${slug}/categories/${categoria}`), 'Farmacia por categoria | Nuvii Baby');
}

export default async function Page({ params }: Props) {
  const { slug, categoria } = await params;
  const payload = assertSeoPayload(
    await fetchSeoPayload(`/seo/pages/marketplaces/${slug}/categories/${categoria}`),
    `/farmacia/${slug}/categoria/${categoria}`,
  );
  return <ProgrammaticSeoPage payload={payload} breadcrumb={[{ label: 'Nuvii Baby', href: '/' }, { label: payload.title }]} />;
}
