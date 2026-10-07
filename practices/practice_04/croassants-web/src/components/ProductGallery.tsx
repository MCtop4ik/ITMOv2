import { useMemo, useState } from 'react'
import type { Product } from '../data/products'
import ProductModal from './ProductModal'

type Filter = 'all' | 'sweet' | 'savory' | 'seasonal'

export default function ProductGallery({ items, lang }: { items: Product[]; lang: 'en' | 'ru' }) {
  const currencySymbol: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' }
  const [filter, setFilter] = useState<Filter>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((i) => i.category === filter)
  }, [items, filter])

  function openAt(idx: number) {
    setOpenIndex(idx)
  }
  function close() {
    setOpenIndex(null)
  }
  function prev() {
    if (openIndex === null) return
    const nextIdx = (openIndex - 1 + filtered.length) % filtered.length
    setOpenIndex(nextIdx)
  }
  function next() {
    if (openIndex === null) return
    const nextIdx = (openIndex + 1) % filtered.length
    setOpenIndex(nextIdx)
  }

  return (
    <div className="linen-section p-4 md:p-6">
      <div className="flex flex-wrap gap-3 mb-6">
        {(['all', 'sweet', 'savory', 'seasonal'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full border ${filter === f ? 'border-indigo text-indigo bg-indigo/10' : 'border-sage/40 text-charcoal/80 hover:bg-sage/10'} focus:outline-none focus:ring-2 focus:ring-indigo/40`}
          >
            {lang === 'ru'
              ? f === 'all'
                ? 'Все'
                : f === 'sweet'
                ? 'Сладкие'
                : f === 'savory'
                ? 'Сытные'
                : 'Сезонные'
              : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid auto-rows-fr gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item, idx) => (
          <button
            key={item.id}
            className="h-full flex flex-col text-left rounded-md overflow-hidden bg-white/80 border border-sage/30 shadow-sm hover:shadow-md motion-safe:hover:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-indigo/40"
            onClick={() => openAt(idx)}
          >
            <div className="relative w-full">
              <div className="w-full" style={{ aspectRatio: '4 / 3' }}>
                <img
                  src={item.image}
                  alt={lang === 'ru' && item.nameRu ? item.nameRu : item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex items-baseline justify-between gap-3">
                 <h4 className="font-bricolage font-ru text-indigo text-lg truncate">{lang === 'ru' && item.nameRu ? item.nameRu : item.name}</h4>
                <span className="font-bricolage text-charcoal tabular-nums">
                  {lang === 'ru'
                    ? `₽ ${(item.price * 100).toFixed(0)}`
                    : `${currencySymbol[item.currency] ?? item.currency} ${item.price.toFixed(2)}`}
                </span>
              </div>
               {(lang === 'ru' ? item.descriptionRu : item.description) && (
                <p className="font-spectral font-ru text-sm text-charcoal/80 mt-1 clamp-2">{lang === 'ru' ? item.descriptionRu : item.description}</p>
               )}
            </div>
          </button>
        ))}
      </div>

      {openIndex !== null && filtered[openIndex] && (
        <ProductModal item={filtered[openIndex]} lang={lang} onClose={close} onPrev={prev} onNext={next} />
      )}
    </div>
  )
}
