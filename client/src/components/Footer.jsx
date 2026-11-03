export default function Footer({ business }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <span className="footer-brand">{business.brand}</span>
        <span>
          <a href={`tel:+${business.phoneRaw}`}>{business.phone}</a>
          {'  '}
          <a href={`mailto:${business.email}`}>{business.email}</a>
        </span>
        <span>© {new Date().getFullYear()} {business.name}</span>
      </div>
    </footer>
  );
}
