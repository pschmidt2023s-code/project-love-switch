import { ProductCard } from './ProductCard';

// Demo products data
const demoProducts = [
  {
    id: '1',
    name: 'Aventus - Inspiriert von Creed',
    category: 'Herren',
    price: 49.99,
    originalPrice: 69.99,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 234,
    inStock: true,
  },
  {
    id: '2',
    name: 'Sauvage - Inspiriert von Dior',
    category: 'Herren',
    price: 39.99,
    originalPrice: 54.99,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 189,
    inStock: true,
  },
  {
    id: '3',
    name: 'Miss Dior - Inspiriert von Dior',
    category: 'Damen',
    price: 44.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
  },
  {
    id: '4',
    name: 'Black Orchid - Inspiriert von Tom Ford',
    category: 'Unisex',
    price: 54.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 312,
    inStock: true,
  },
  {
    id: '5',
    name: 'Bleu de Chanel - Inspiriert',
    category: 'Herren',
    price: 42.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
  },
  {
    id: '6',
    name: 'La Vie Est Belle - Inspiriert',
    category: 'Damen',
    price: 38.99,
    originalPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 167,
    inStock: false,
  },
];

export function PerfumeGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {demoProducts.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
