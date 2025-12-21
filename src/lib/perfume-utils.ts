import { perfumes } from '@/data/perfumes';

export function getPerfumeNameById(perfumeId: string, variantId: string): string {
  const perfume = perfumes.find(p => p.id === perfumeId);
  if (!perfume) {
    return `${perfumeId} (${variantId})`;
  }

  const variant = perfume.variants.find(v => v.id === variantId);
  if (!variant) {
    return `${perfume.name} (${variantId})`;
  }

  return variant.name;
}

export function formatOrderItems(items: any[]): string {
  return items.map(item =>
    `${item.quantity}x ${getPerfumeNameById(item.perfume_id, item.variant_id)}`
  ).join(', ');
}
