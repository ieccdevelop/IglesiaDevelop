
import React, { useState } from 'react';
import { Book, Sale, CashTransaction, PaymentMethod } from '../types';
import { ShoppingBag, Search, CreditCard, Banknote, Landmark, CheckCircle2, ScanLine, X } from 'lucide-react';
import Scanner from '../components/Scanner';

interface Props {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setCash: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
}

const POS: React.FC<Props> = ({ books, setBooks, setSales, setCash }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const filteredBooks = books.filter(b => 
    b.stock > 0 && (
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.includes(searchTerm)
    )
  );

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setFinalPrice(book.sellingPrice);
    setSearchTerm('');
    setIsScanning(false);
  };

  const handleScan = (isbn: string) => {
    const book = books.find(b => b.isbn === isbn);
    if (book) {
      if (book.stock > 0) {
        handleSelectBook(book);
      } else {
        alert(`El libro "${book.title}" no tiene stock disponible.`);
        setIsScanning(false);
      }
    } else {
      alert(`No se encontró ningún libro con el ISBN: ${isbn}`);
      setIsScanning(false);
    }
  };

  const handleCompleteSale = () => {
    if (!selectedBook) return;

    const saleId = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();

    const newSale: Sale = {
      id: saleId,
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      finalPrice,
      paymentMethod,
      timestamp
    };

    // Update state
    setSales(prev => [...prev, newSale]);
    setBooks(prev => prev.map(b => b.id === selectedBook.id ? { ...b, stock: b.stock - 1 } : b));
    
    // Add to cash ledger if it was cash
    if (paymentMethod === PaymentMethod.CASH) {
      const newTransaction: CashTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'IN',
        amount: finalPrice,
        description: `Venta: ${selectedBook.title}`,
        timestamp
      };
      setCash(prev => [...prev, newTransaction]);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedBook(null);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
      {/* Search & Selection */}
      <div className="lg:col-span-2 flex flex-col space-y-6 overflow-hidden">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search size={20} className="text-slate-400" />
              Buscar Producto
            </h2>
            <button 
              onClick={() => setIsScanning(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-semibold shadow-lg shadow-slate-900/10"
            >
              <ScanLine size={18} />
              Escanear Código
            </button>
          </div>
          
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Introduce título o ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {searchTerm.length > 0 && filteredBooks.map(book => (
              <button 
                key={book.id}
                onClick={() => handleSelectBook(book)}
                className="w-full p-4 flex items-center justify-between border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-indigo-200 transition-all text-left group"
              >
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{book.title}</p>
                  <p className="text-xs text-slate-400">{book.author} | ISBN: {book.isbn}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{book.sellingPrice.toFixed(2)}€</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Stock: {book.stock}</p>
                </div>
              </button>
            ))}
            {searchTerm.length > 0 && filteredBooks.length === 0 && (
              <p className="text-center text-slate-400 py-10">No hay existencias o no se encuentra el libro.</p>
            )}
            {searchTerm.length === 0 && !selectedBook && (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50">
                <ShoppingBag size={64} className="mb-4" />
                <p className="font-medium">Busca un libro o escanea el código para empezar</p>
              </div>
            )}
            {selectedBook && searchTerm.length === 0 && (
               <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                 <div>
                   <p className="text-xs font-bold text-indigo-400 uppercase">Actualmente preparando:</p>
                   <p className="font-bold text-indigo-900">{selectedBook.title}</p>
                 </div>
                 <CheckCircle2 className="text-indigo-500" size={24} />
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl flex flex-col h-full sticky top-8">
        <h2 className="text-xl font-bold mb-8">Checkout</h2>

        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-90 duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600">¡Venta Exitosa!</h3>
            <p className="text-slate-500">Actualizando inventario...</p>
          </div>
        ) : selectedBook ? (
          <div className="flex-1 flex flex-col space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Libro seleccionado</p>
              <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{selectedBook.title}</h3>
              <p className="text-sm text-slate-500">{selectedBook.author}</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 block">Precio Final de Venta</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(parseFloat(e.target.value))}
                  className="w-full pl-8 pr-4 py-4 text-2xl font-bold border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">€</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 block">Forma de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: PaymentMethod.CASH, icon: <Banknote size={20} />, label: 'Efectivo' },
                  { id: PaymentMethod.CARD, icon: <CreditCard size={20} />, label: 'Tarjeta' },
                  { id: PaymentMethod.TRANSFER, icon: <Landmark size={20} />, label: 'Transf.' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1 ${paymentMethod === method.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                  >
                    {method.icon}
                    <span className="text-[10px] font-bold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-auto">
              <button 
                onClick={handleCompleteSale}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                Cobrar {finalPrice.toFixed(2)}€
              </button>
              <button 
                onClick={() => setSelectedBook(null)}
                className="w-full mt-3 py-3 text-slate-400 font-medium hover:text-red-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-300">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p className="font-medium opacity-50 px-8">Busca un libro o pulsa el botón de escaneo para empezar la venta</p>
          </div>
        )}
      </div>

      {isScanning && (
        <Scanner 
          onScan={handleScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}
    </div>
  );
};

export default POS;
