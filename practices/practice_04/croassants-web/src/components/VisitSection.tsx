export default function VisitSection({ lang = 'en' }: { lang?: 'en' | 'ru' }) {
  return (
    <section id="visit" className="mx-auto max-w-wide px-6 py-16">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="font-bricolage font-ru text-3xl md:text-4xl text-indigo mb-4">{lang === 'ru' ? 'Посетите Four & Butter' : 'Visit Four & Butter'}</h2>
          <address className="not-italic font-spectral font-ru text-base leading-relaxed">
            12 Market Lane<br />
            City Center<br />
            {lang === 'ru' ? 'Ежедневно открыты 7:00–13:00' : 'Open daily 7:00–13:00'}
          </address>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="https://maps.google.com/?q=12+Market+Lane"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-5 py-3 rounded-full border border-sage/40 text-charcoal hover:bg-sage/10 focus:outline-none focus:ring-2 focus:ring-indigo/40"
            >
              {lang === 'ru' ? 'Показать на картах' : 'Open in Maps'}
            </a>
            <span className="text-charcoal/70 text-sm font-ru">{lang === 'ru' ? 'Нажмите, чтобы открыть адрес в Google Картах' : 'Opens the address in Google Maps'}</span>
          </div>
          <div className="mt-6">
            <iframe
              title={lang === 'ru' ? 'Карта расположения' : 'Location map'}
              className="w-full rounded-md border border-sage/40"
              style={{ aspectRatio: '16 / 9' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=12%20Market%20Lane&output=embed"
            />
          </div>
        </div>
        <div>
          <img
            className="w-full rounded-md shadow-sm"
            src="/images/map-snapshot.jpg"
            alt="Map snapshot"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
