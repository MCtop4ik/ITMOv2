export default function Hero({ lang = 'en' }: { lang?: 'en' | 'ru' }) {
  return (
    <section className="relative min-h-screen">
      {/* Background image */}
      <img
        src="/images/hero-croissant.png"
        alt="Fresh croissant"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Gradient overlay to ensure text readability over mixed tones */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10 md:from-crust/50 md:via-crust/25 md:to-crust/10" aria-hidden="true" />
      {/* Steam overlay: subtle, single reveal above gradient */}
      <div className="absolute inset-0 pointer-events-none motion-safe">
        <div className="steam-swish animate-steam" />
        <div className="steam-swish animate-steam delay-300" />
        <div className="steam-swish animate-steam delay-700" />
      </div>
      {/* Centered content */}
      <div className="relative z-10 mx-auto px-6 flex flex-col items-center justify-center text-center min-h-screen">
        <h1 className="font-bricolage font-ru text-white text-4xl md:text-6xl leading-tight max-w-prose">
          {lang === 'ru' ? 'Печём на рассвете — к полудню на витрине.' : 'Laminated at dawn, sold by noon.'}
        </h1>
        <p className="font-spectral font-ru text-white/90 text-lg md:text-xl leading-relaxed mt-4 max-w-prose">
          {lang === 'ru' ? 'Круассаны, слоёные с заботой: ночная расстойка и утренняя выпечка. Приходите на первый батч.' : 'Croissants layered with care, proofed overnight, baked each morning. Come for the first batch.'}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="#gallery"
            className="inline-flex items-center px-6 py-3 rounded-full border border-white/60 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Explore our croissants"
          >
            {lang === 'ru' ? 'Наши круассаны' : 'Our croissants'}
          </a>
          <a
            href="#visit"
            className="inline-flex items-center px-6 py-3 rounded-full border border-white/30 text-white/85 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label={lang === 'ru' ? 'Наш адрес' : 'Our address'}
          >
            {/* Location pin icon, toned down to avoid over-emphasis */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 text-white/70"
              aria-hidden="true"
            >
              <path d="M12 2c-3.3 0-6 2.7-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.3-2.7-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
            {lang === 'ru' ? 'Адрес' : 'Address'}
          </a>
        </div>
      </div>
    </section>
  )
}
