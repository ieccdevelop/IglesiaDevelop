
import React from 'react';
import { Book, Sale, CashTransaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { TrendingUp, Package, Wallet, ShoppingBag } from 'lucide-react';

interface Props {
  books: Book[];
  sales: Sale[];
  cash: CashTransaction[];
}

const Dashboard: React.FC<Props> = ({ books, sales, cash }) => {
  const inventoryValue = books.reduce((acc, b) => acc + (b.purchasePrice * b.stock), 0);
  const potentialRevenue = books.reduce((acc, b) => acc + (b.sellingPrice * b.stock), 0);
  const currentCash = cash.reduce((acc, t) => t.type === 'IN' ? acc + t.amount : acc - t.amount, 0);
  const totalSalesCount = sales.length;

  // Prepare chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const daySales = sales.filter(s => new Date(s.timestamp).toISOString().split('T')[0] === date);
    return {
      date: date.split('-').slice(1).reverse().join('/'),
      ventas: daySales.reduce((acc, s) => acc + s.finalPrice, 0)
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Resumen operativo de tu librería</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Package className="text-blue-600" />} 
          label="Libros en Stock" 
          value={books.reduce((acc, b) => acc + b.stock, 0).toString()} 
          subValue={`${books.length} títulos únicos`}
        />
        <StatCard 
          icon={<TrendingUp className="text-indigo-600" />} 
          label="Valor Inventario" 
          value={`${inventoryValue.toFixed(2)}€`} 
          subValue={`PVP Total: ${potentialRevenue.toFixed(2)}€`}
        />
        <StatCard 
          icon={<ShoppingBag className="text-emerald-600" />} 
          label="Ventas Totales" 
          value={`${totalSalesCount}`} 
          subValue="Histórico"
        />
        <StatCard 
          icon={<Wallet className="text-amber-600" />} 
          label="Saldo en Caja" 
          value={`${currentCash.toFixed(2)}€`} 
          subValue="Efectivo disponible"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            Ingresos por Ventas (Últimos 7 días)
            <span className="text-xs font-normal text-slate-400">Actualizado hace un momento</span>
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="ventas" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Últimos Movimientos</h3>
          <div className="space-y-4">
            {sales.slice(-5).reverse().map(sale => (
              <div key={sale.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShoppingBag size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{sale.bookTitle}</p>
                  <p className="text-xs text-slate-500">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                </div>
                <p className="text-sm font-bold text-slate-800">+{sale.finalPrice}€</p>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-center text-slate-400 py-10 italic">No hay ventas registradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, subValueText?: string, subValue: string }> = ({ icon, label, value, subValue }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 rounded-xl bg-slate-50">{icon}</div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
    <div className="space-y-1">
      <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
      <p className="text-xs text-slate-400">{subValue}</p>
    </div>
  </div>
);

export default Dashboard;
