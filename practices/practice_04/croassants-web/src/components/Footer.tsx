export default function Footer({ lang = 'en' }: { lang?: 'en' | 'ru' }) {
  return (
    <footer className="mt-8 border-t border-sage/30">
      <div className="mx-auto max-w-wide px-6 py-8 text-sm text-charcoal/80 flex items-center justify-between gap-4 flex-wrap">
        <p>&copy; {new Date().getFullYear()} Four &amp; Butter. All rights reserved.</p>
        {lang === 'ru' && (
          <p className="ml-auto text-right text-charcoal/70 font-ru">
            Съешь ещё этих мягких французских булок, да выпей же чаю
          </p>
        )}
      </div>
    </footer>
  )
}
