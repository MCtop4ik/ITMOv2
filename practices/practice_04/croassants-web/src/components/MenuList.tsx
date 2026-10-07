import type { Product } from '../data/products'

export default function MenuList({ items, lang = 'en' }: { items: Product[]; lang?: 'en' | 'ru' }) {
  return (
    <ul className="divide-y divide-sage/30">
      {items.map((item) => (
        <li key={item.id} className="py-3">
          <div className="flex items-baseline gap-3">
            <span className="font-spectral text-lg">{lang === 'ru' && item.nameRu ? item.nameRu : item.name}</span>
            <span className="flex-1 border-b border-dotted border-sage/70 translate-y-1" aria-hidden="true"></span>
            <span className="font-bricolage text-indigo tabular-nums" aria-label={`Price ${item.currency} ${item.price.toFixed(2)}`}>{({ EUR: '€', USD: '$', GBP: '£' } as Record<string, string>)[item.currency] ?? item.currency} {item.price.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-start gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={`${lang === 'ru' && item.nameRu ? item.nameRu : item.name}`}
                className="w-24 h-24 object-cover rounded-md shadow-sm"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f5fd?q=80&w=320&auto=format&fit=crop'; }}
              />
            )}
            {(lang === 'ru' ? item.descriptionRu : item.description) && (
              <p className="font-spectral text-sm text-charcoal/80 max-w-prose">{lang === 'ru' ? item.descriptionRu : item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
