
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingCart, 
  Wallet, 
  Plus, 
  Search,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Package,
  LogOut,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { Book, Sale, CashTransaction, PaymentMethod } from './types';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import CashLedger from './pages/CashLedger';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('biblio_books');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('biblio_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem('biblio_cash');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('biblio_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('biblio_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('biblio_cash', JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Desktop Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">BiblioGest <span className="text-indigo-400">Pro</span></h1>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/inventario" icon={<Package size={20} />} label="Inventario" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/ventas" icon={<ShoppingCart size={20} />} label="Terminal Punto de Venta" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/caja" icon={<Wallet size={20} />} label="Gestión de Caja" onClick={() => setIsSidebarOpen(false)} />
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Plus size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Vendedor</p>
                  <p className="text-sm font-medium">Admin Principal</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-lg">BiblioGest Pro</h1>
            <div className="w-10"></div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard books={books} sales={sales} cash={cashTransactions} />} />
              <Route path="/inventario" element={<Inventory books={books} setBooks={setBooks} />} />
              <Route path="/ventas" element={<POS books={books} setBooks={setBooks} setSales={setSales} setCash={setCashTransactions} />} />
              <Route path="/caja" element={<CashLedger transactions={cashTransactions} setTransactions={setCashTransactions} />} />
            </Routes>
          </main>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {isActive && <ChevronRight size={16} className="ml-auto" />}
    </Link>
  );
};

export default App;
