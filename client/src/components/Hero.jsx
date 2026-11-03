// The shade swatches are the signature visual: each is a smear of colour,
// like a lipstick swatched on the back of the hand.
const SWATCHES = [
  { name: 'Bridal red', from: '#C1273F', to: '#7E1328' },
  { name: 'Rose petal', from: '#D9727F', to: '#A9485A' },
  { name: 'Haldi gold', from: '#E3B35E', to: '#B5832F' },
  { name: 'Nude glow', from: '#E2B09C', to: '#B57F6A' },
  { name: 'Wine', from: '#7A2944', to: '#46142A' },
];

export default function Hero({ business }) {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="hero-kicker">Makeup artist in {business.address.line2.split(',')[0]}</p>
          <h1 className="hero-title">
            Swati
            <br />
            <em>Sharma</em>
          </h1>
          <p className="hero-lede">{business.tagline}</p>
          <div className="hero-actions">
            <a className="btn" href="#enquire">Send an enquiry</a>
            <a className="btn btn-ghost" href={`https://wa.me/${business.phoneRaw}`} target="_blank" rel="noreferrer">
              WhatsApp {business.phone.replace('+91 ', '')}
            </a>
          </div>
        </div>

        <ul className="swatches" aria-label="Signature shades">
          {SWATCHES.map((s, i) => (
            <li key={s.name} style={{ '--from': s.from, '--to': s.to, '--i': i }}>
              <span className="swatch" aria-hidden="true" />
              <span className="swatch-name">{s.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
