
import React, { useState } from 'react';
import { CashTransaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, Calendar } from 'lucide-react';

interface Props {
  transactions: CashTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
}

const CashLedger: React.FC<Props> = ({ transactions, setTransactions }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<CashTransaction>>({
    type: 'IN',
    amount: 0,
    description: ''
  });

  const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: CashTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.type as 'IN' | 'OUT',
      amount: formData.amount || 0,
      description: formData.description || '',
      timestamp: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setIsAdding(false);
    setFormData({ type: 'IN', amount: 0, description: '' });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Caja y Arqueos</h2>
          <p className="text-slate-500">Control de flujo de efectivo</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
        >
          <Plus size={18} />
          Nuevo Movimiento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ArrowUpRight size={80} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Entradas</p>
          <h4 className="text-2xl font-bold text-emerald-600">+{totalIn.toFixed(2)}€</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ArrowDownLeft size={80} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Salidas</p>
          <h4 className="text-2xl font-bold text-red-600">-{totalOut.toFixed(2)}€</h4>
        </div>
        <div className={`p-6 rounded-2xl border shadow-lg overflow-hidden relative transition-all ${balance >= 0 ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-red-600 border-red-700 text-white'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet size={80} />
          </div>
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Saldo Neto</p>
          <h4 className="text-3xl font-black">{balance.toFixed(2)}€</h4>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Historial de Movimientos</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Calendar size={14} />
            Últimos 30 días
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map(t => (
            <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${t.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {t.type === 'IN' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{t.description}</p>
                  <p className="text-xs text-slate-400">{new Date(t.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <span className={`font-black text-lg ${t.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                {t.type === 'IN' ? '+' : '-'}{t.amount.toFixed(2)}€
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="py-20 text-center text-slate-300">
              <p className="font-medium italic">No se han registrado movimientos todavía</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Transaction */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Nuevo Movimiento</h3>
            <form onSubmit={handleAddTransaction} className="space-y-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'IN' }))}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.type === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Entrada (+)
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'OUT' }))}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.type === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Salida (-)
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Importe (€)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  className="w-full px-5 py-4 text-2xl font-black border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Descripción / Concepto</label>
                <input 
                  required
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Cambio de turno, Pago proveedor..."
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl"
                >
                  Cerrar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/30 hover:bg-indigo-700"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashLedger;
