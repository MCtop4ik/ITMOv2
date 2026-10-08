const steps = [
  { title: 'Proof', text: 'Slow overnight proof for flavor and structure.' },
  { title: 'Fold', text: 'Hand-rolled folds to keep layers distinct.' },
  { title: 'Laminate', text: 'Cold butter sheets, patient lamination.' },
  { title: 'Bake', text: 'Morning bake for a shatter-crisp crust.' },
]

export default function ProcessSteps() {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {steps.map((s) => (
        <div key={s.title} className="p-4 border border-sage/30 rounded-md bg-white/60">
          <h3 className="font-bricolage text-indigo text-xl mb-2">{s.title}</h3>
          <p className="font-spectral text-base leading-relaxed">{s.text}</p>
        </div>
      ))}
    </div>
  )
}
