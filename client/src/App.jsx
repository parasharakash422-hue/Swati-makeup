import { useEffect, useState } from 'react';
import { getBusiness, getServices } from './api.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Menu from './components/Menu.jsx';
import EnquiryForm from './components/EnquiryForm.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    Promise.all([getBusiness(), getServices()])
      .then(([b, s]) => {
        setBusiness(b);
        setServices(s);
      })
      .catch(() => setLoadError('The site could not reach its server. Please call +91 85870 00481 to book.'));
  }, []);

  const enquireFor = (id) => {
    setSelectedService(id);
    document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loadError) return <p className="load-error">{loadError}</p>;
  if (!business) return <div className="loading" aria-label="Loading" />;

  return (
    <>
      <Header business={business} />
      <main>
        <Hero business={business} />
        <About business={business} />
        <Menu services={services} onEnquire={enquireFor} />
        <EnquiryForm
          business={business}
          services={services}
          selectedService={selectedService}
          onServiceChange={setSelectedService}
        />
        <Contact business={business} />
      </main>
      <Footer business={business} />
    </>
  );
}
