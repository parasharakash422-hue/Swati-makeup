export default function Header({ business }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a href="#top" className="brand" aria-label={`${business.name}, home`}>
          <span className="brand-name">{business.name}</span>
          <span className="brand-role">Makeup artist</span>
        </a>
        <nav aria-label="Main">
          <a href="#menu">Menu</a>
          <a href="#enquire">Enquire</a>
          <a href="#contact">Contact</a>
          <a className="btn btn-small" href={`tel:+${business.phoneRaw}`}>Call</a>
        </nav>
      </div>
    </header>
  );
}
