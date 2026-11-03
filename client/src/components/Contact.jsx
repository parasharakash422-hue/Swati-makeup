export default function Contact({ business }) {
  const { address } = business;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(business.mapsQuery)}&z=15&output=embed`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapsQuery)}`;

  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact-inner">
        <div className="contact-details">
          <h2 id="contact-title">Contact Swati</h2>

          <dl>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:+${business.phoneRaw}`}>{business.phone}</a>
                <a className="contact-sub" href={`https://wa.me/${business.phoneRaw}`} target="_blank" rel="noreferrer">
                  Message on WhatsApp
                </a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </dd>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>
                <address>
                  {address.line1}
                  <br />
                  {address.line2}
                </address>
                <a className="contact-sub" href={directions} target="_blank" rel="noreferrer">
                  Get directions
                </a>
              </dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>{business.hours}</dd>
            </div>
          </dl>
        </div>

        <div className="map">
          <iframe
            title={`Map showing ${address.line1}`}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
