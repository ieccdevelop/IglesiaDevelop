
import React, { useState } from 'react';
import { Book } from '../types';
// Fixed: Added missing Package and X icons to the lucide-react import list
import { Plus, Search, ScanLine, Trash2, Edit2, Loader2, BookOpen, Package, X } from 'lucide-react';
import Scanner from '../components/Scanner';
import { fetchBookDetailsByISBN } from '../services/geminiService';

interface Props {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}

const Inventory: React.FC<Props> = ({ books, setBooks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Book>>({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    vendor: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
  });

  const handleScan = async (isbn: string) => {
    setIsScanning(false);
    setIsAdding(true);
    setIsLoading(true);
    setFormData(prev => ({ ...prev, isbn }));

    const details = await fetchBookDetailsByISBN(isbn);
    if (details) {
      setFormData(prev => ({
        ...prev,
        title: details.title || '',
        author: details.author || '',
        publisher: details.publisher || '',
        sellingPrice: details.suggestedPrice || 0
      }));
    }
    setIsLoading(false);
  };

  const handleManualLookup = async () => {
    if (!formData.isbn) return;
    setIsLoading(true);
    const details = await fetchBookDetailsByISBN(formData.isbn);
    if (details) {
      setFormData(prev => ({
        ...prev,
        title: details.title || '',
        author: details.author || '',
        publisher: details.publisher || '',
        sellingPrice: details.suggestedPrice || 0
      }));
    }
    setIsLoading(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBook: Book = {
      ...formData as Book,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    setBooks(prev => [newBook, ...prev]);
    setIsAdding(false);
    setFormData({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      vendor: '',
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
      setBooks(prev => prev.filter(b => b.id !== id));
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.includes(searchTerm) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario</h2>
          <p className="text-slate-500">Gestiona tus existencias de libros</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsScanning(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
          >
            <ScanLine size={18} />
            Escanear ISBN
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/10"
          >
            <Plus size={18} />
            Añadir Manual
          </button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por título, autor o ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex gap-4">
              <div className="w-20 h-28 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                <BookOpen size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{book.title}</h3>
                <p className="text-sm text-slate-500 truncate">{book.author}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-slate-400 font-medium">ISBN: {book.isbn}</p>
                  <p className="text-xs text-slate-400 font-medium">Prov: {book.vendor}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Precio Venta</span>
                <span className="text-lg font-bold text-indigo-600">{book.sellingPrice.toFixed(2)}€</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Stock</span>
                <span className={`text-lg font-bold ${book.stock < 5 ? 'text-red-500' : 'text-slate-800'}`}>{book.stock} uds.</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleDelete(book.id)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredBooks.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              {/* Fixed: Package icon is now imported and usable */}
              <Package size={32} />
            </div>
            <p className="text-slate-500">No se encontraron libros. ¿Quieres añadir uno nuevo?</p>
          </div>
        )}
      </div>

      {/* Modal Añadir/Editar */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">Añadir Nuevo Libro</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full">
                {/* Fixed: X icon is now imported and usable */}
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">ISBN</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      value={formData.isbn}
                      onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                      onBlur={handleManualLookup}
                      className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="9780123456789"
                    />
                    {isLoading && <Loader2 className="absolute right-3 top-2.5 animate-spin text-indigo-500" size={18} />}
                  </div>
                  <p className="text-[10px] text-slate-400">Introduce el ISBN y BiblioGest buscará los datos por ti.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Título</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Autor</label>
                  <input 
                    required
                    type="text" 
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Editorial</label>
                  <input 
                    required
                    type="text" 
                    value={formData.publisher}
                    onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Proveedor / Vendedor</label>
                  <input 
                    required
                    type="text" 
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Distribuidora S.A."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Stock Inicial</label>
                  <input 
                    required
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Precio Compra (€)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Precio Venta (€)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Guardar Libro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isScanning && <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
    </div>
  );
};

export default Inventory;
