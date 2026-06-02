/** Resolve a unit label (un / lenço / g / ml) from product metadata. */
export function resolveUnit(product: {
  category?: string | null;
  title?: string | null;
  variantLabel?: string | null;
}): string {
  const cat = (product.category ?? '').toLowerCase();
  const title = (product.title ?? '').toLowerCase();
  const variant = (product.variantLabel ?? '').toLowerCase().trim();

  if (cat.includes('fraldas')) return 'un';
  if (cat.includes('lencos') || cat.includes('lenços')) return 'lenço';

  if (variant.endsWith(' ml') || /\d+\s*ml/.test(variant)) return 'ml';
  if (variant.endsWith(' g') || /\d+\s*g$/.test(variant)) return 'g';

  if (title.includes('shampoo') || title.includes('condicionador')) return 'ml';
  if (title.includes('sabonete liquido') || title.includes('sabonete líquido')) return 'ml';
  if (title.includes('sabonete')) return 'g';
  if (title.includes('pomada') || title.includes('creme preventivo') || title.includes('bepantol')) return 'g';

  if (cat.includes('cuidados')) {
    if (variant.endsWith(' g')) return 'g';
    if (variant.endsWith(' ml')) return 'ml';
  }

  return 'un';
}

/** Format price-per-unit with correct label: "R$ 1,44/un", "R$ 0,73/lenço", etc. */
export function formatPricePerUnit(pricePerUnit: number, unit: string): string {
  return `${pricePerUnit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/${unit}`;
}
