const STEPS = [
  { title: 'Enquire', text: 'Send your date, venue and the looks you need. Swati gets back to you by call or WhatsApp.' },
  { title: 'Trial', text: 'For brides, an optional trial to settle the base, eyes and hairstyle.' },
  { title: 'Confirm', text: 'Agree the looks and the quote, and your date is reserved.' },
  { title: 'Get ready', text: 'Swati arrives at your home or venue with everything needed, or you come to the studio.' },
];

export default function About() {
  return (
    <section className="about" aria-labelledby="about-title">
      <div className="wrap about-inner">
        <div className="about-text">
          <h2 id="about-title">Makeup that lasts from the first photo to the last dance</h2>
          <p>
            Swati Sharma does bridal, engagement, party and photoshoot makeup across Greater Noida West,
            Noida, Ghaziabad and Delhi NCR. Every look starts from your skin, your outfit and the lighting
            of your event, so you look like yourself on your best day, in person and on camera.
          </p>
          <p>She uses professional, long-wear products and works at your home, at the venue, or at her studio.</p>
        </div>

        <ol className="steps" aria-label="How booking works">
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
