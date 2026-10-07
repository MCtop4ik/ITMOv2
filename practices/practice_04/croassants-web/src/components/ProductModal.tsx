import { useEffect, useRef } from 'react'
import type { Product } from '../data/products'

export default function ProductModal({
  item,
  lang = 'en',
  onClose,
  onPrev,
  onNext,
}: {
  item: Product
  lang?: 'en' | 'ru'
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    const el = ref.current
    if (el) el.focus()
  }, [])

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        className="relative mx-auto max-w-2xl mt-16 md:mt-24 bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-sage/30">
          <h3 className="font-bricolage font-ru text-indigo text-xl">{lang === 'ru' && item.nameRu ? item.nameRu : item.name}</h3>
          <button
            aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
            className="text-charcoal/70 hover:text-indigo focus:outline-none focus:ring-2 focus:ring-indigo/40 rounded-sm"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-4 grid md:grid-cols-2 gap-4">
          <div className="relative w-full">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-md border border-sage/30 bg-white/60">
              <img
                src={item.image}
                alt={lang === 'ru' && item.nameRu ? item.nameRu : item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <p className="font-spectral font-ru text-base leading-relaxed text-charcoal/90">{lang === 'ru' ? item.descriptionRu ?? item.description : item.description}</p>
            <div className="mt-3 text-sm text-charcoal/80">
              <span className="font-bricolage text-indigo tabular-nums">
                {lang === 'ru' ? `₽ ${(item.price * 100).toFixed(0)}` : `${{ EUR: '€', USD: '$', GBP: '£' }[item.currency] ?? item.currency} ${item.price.toFixed(2)}`}
              </span>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((t) => {
                  const tagMap: Record<string, string> = {
                    sweet: 'Сладкое',
                    savory: 'Сытное',
                    crunchy: 'Хрустящее',
                    warm: 'Тёплое',
                    sandwich: 'Сэндвич',
                    trend: 'Тренд',
                    signature: 'Фирменное',
                    autumn: 'Осень',
                    healthy: 'Здоровое',
                    vegan: 'Веганское',
                    vegetarian: 'Вегетарианское',
                    'gluten-free': 'Без глютена',
                    'dairy-free': 'Без молочного',
                    'nut-free': 'Без орехов',
                    spicy: 'Острое',
                    new: 'Новинка',
                    limited: 'Ограниченная серия',
                    classic: 'Классика',
                    'kid-friendly': 'Для детей',
                  }
                  const label = lang === 'ru' ? tagMap[t] ?? t : t
                  return (
                    <span key={t} className="px-2 py-1 text-xs rounded-full bg-sage/20 text-charcoal/80 border border-sage/40">
                      {label}
                    </span>
                  )
                })}
              </div>
            )}
            {item.allergens && item.allergens.length > 0 && (
              <div className="mt-3 text-xs text-charcoal/70">
                {lang === 'ru' ? 'Аллергены' : 'Allergens'}:{' '}
                {(lang === 'ru'
                  ? item.allergens.map((a) => {
                      const allergenMap: Record<string, string> = {
                        gluten: 'глютен',
                        dairy: 'молочные',
                        eggs: 'яйца',
                        nuts: 'орехи',
                        fish: 'рыба',
                      }
                      return allergenMap[a] ?? a
                    })
                  : item.allergens
                ).join(', ')}
              </div>
            )}
            <div className="mt-6 flex items-center gap-3">
              <button onClick={onPrev} className="px-3 py-2 rounded-md border border-sage/40 bg-white hover:bg-sage/10 focus:outline-none focus:ring-2 focus:ring-indigo/40">{lang === 'ru' ? 'Назад' : 'Prev'}</button>
              <button onClick={onNext} className="px-3 py-2 rounded-md border border-sage/40 bg-white hover:bg-sage/10 focus:outline-none focus:ring-2 focus:ring-indigo/40">{lang === 'ru' ? 'Далее' : 'Next'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
