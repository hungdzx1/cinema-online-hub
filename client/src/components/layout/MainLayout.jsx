
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = ({ children }) => {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};
