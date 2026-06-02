import type { Metadata } from 'next';
import { ProgrammaticSeoPage } from '@/components/seo/ProgrammaticSeoPage';
import { assertSeoPayload, fetchSeoPayload, metadataFromPayload } from '@/app/programmatic-seo-helpers';

type Props = { params: Promise<{ slug: string }> };
const intent = 'melhor-custo-beneficio';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataFromPayload(await fetchSeoPayload(`/seo/pages/category/${slug}/${intent}`), 'Melhor custo-beneficio | Radar do Berço');
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const payload = assertSeoPayload(await fetchSeoPayload(`/seo/pages/category/${slug}/${intent}`), `/melhor-custo-beneficio/${slug}`);
  return <ProgrammaticSeoPage payload={payload} breadcrumb={[{ label: 'Radar do Berço', href: '/' }, { label: payload.title }]} />;
}
