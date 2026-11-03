import { useState } from 'react';
import { rupees } from '../api.js';

export default function Menu({ services, onEnquire }) {
  const [active, setActive] = useState(0);
  const category = services[active];

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <div className="wrap">
        <div className="menu-head">
          <h2 id="menu-title">Service menu</h2>
          <p>Starting prices. Your final quote depends on the look, venue and number of people.</p>
        </div>

        <div className="tabs" role="tablist" aria-label="Service categories">
          {services.map((c, i) => (
            <button
              key={c.category}
              role="tab"
              id={`tab-${i}`}
              aria-selected={i === active}
              aria-controls="menu-panel"
              className="tab"
              onClick={() => setActive(i)}
            >
              {c.category}
            </button>
          ))}
        </div>

        {category && (
          <ul className="menu-list" id="menu-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
            {category.items.map((item) => (
              <li key={item.id} className="menu-item">
                <span className="pan" style={{ '--shade': item.shade }} aria-hidden="true" />
                <div className="menu-item-text">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="menu-item-meta">
                  <span className="price">
                    <small>from</small> {rupees(item.price)}
                  </span>
                  <span className="duration">{item.duration}</span>
                </div>
                <button className="btn btn-line" onClick={() => onEnquire(item.id)}>
                  Enquire<span className="visually-hidden"> about {item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
