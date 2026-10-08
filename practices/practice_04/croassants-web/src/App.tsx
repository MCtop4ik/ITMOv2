import Hero from './components/Hero'
// import ProcessSteps from './components/ProcessSteps'
// import MenuList from './components/MenuList'
import VisitSection from './components/VisitSection'
import Footer from './components/Footer'
import products from './data/products'
import { useActiveSection } from './hooks/useActiveSection'
import ProductGallery from './components/ProductGallery'
import { useState } from 'react'

export default function App() {
  const [lang, setLang] = useState<'en' | 'ru'>('en')
  const active = useActiveSection(['gallery', 'visit'])
  return (
    <div className="text-charcoal min-h-screen">
      <header className="border-b border-copper/40 fixed top-0 left-0 right-0 z-50 backdrop-blur bg-gradient-to-b from-black/70 to-crust/60 supports-[backdrop-filter]:from-crust/60 supports-[backdrop-filter]:to-crust/50 shadow-md">
        <div className="mx-auto max-w-wide px-6 py-3 flex items-center justify-between">
          <a href="#" className="font-bricolage text-white text-xl focus:outline-none focus:ring-2 focus:ring-white/60 rounded-sm">Four &amp; Butter</a>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6">
              <a className={`focus:outline-none focus:ring-2 focus:ring-white/60 rounded-sm ${active === 'gallery' ? 'text-white font-medium' : 'text-white/80 hover:text-white'}`} href="#gallery">{lang === 'ru' ? 'Меню' : 'Menu'}</a>
              <a className={`focus:outline-none focus:ring-2 focus:ring-white/60 rounded-sm ${active === 'visit' ? 'text-white font-medium' : 'text-white/80 hover:text-white'}`} href="#visit">{lang === 'ru' ? 'Посетить' : 'Visit'}</a>
            </nav>
            <div className="flex items-center gap-2">
              <button
                className={`px-2 py-1 rounded-sm ${lang === 'en' ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white'} focus:outline-none focus:ring-2 focus:ring-white/60`}
                onClick={() => setLang('en')}
                aria-label="Switch to English"
              >EN</button>
              <button
                className={`px-2 py-1 rounded-sm ${lang === 'ru' ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white'} focus:outline-none focus:ring-2 focus:ring-white/60`}
                onClick={() => setLang('ru')}
                aria-label="Переключить на русский"
              >RU</button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Hero lang={lang} />
        <section id="gallery" className="mx-auto max-w-wide px-6 py-16">
          <h2 className="font-bricolage font-ru text-3xl md:text-4xl text-indigo mb-6">{lang === 'ru' ? 'Меню круассанов' : 'Croissant Menu'}</h2>
          <ProductGallery items={products} lang={lang} />
        </section>
        {/* Menu list removed; gallery is the primary catalog */}
        <VisitSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  )
}
