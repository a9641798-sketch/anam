'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/db';
import Link from 'next/link';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  categories: Category | null;
  product_images?: { image_url: string; is_cover: boolean }[];
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');

  const fetchProductsAndCategories = async () => {
    setLoading(true);

    const { data: catsData } = await supabase!.from('categories').select('*').order('name');
    if (catsData) setAllCategories(catsData);

    let { data, error } = await supabase!
      .from('products')
      .select('*, categories(name), product_images(image_url, is_cover)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Join failed, falling back:', error.message);
      const { data: fallbackData } = await supabase!
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      data = fallbackData;
    }

    if (data) setProducts(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const updateCategory = async (productId: string, newCategoryId: string) => {
    setUpdatingId(productId);
    const { error } = await supabase!
      .from('products')
      .update({ category_id: newCategoryId || null })
      .eq('id', productId);

    if (!error) {
      setProducts(products.map(p =>
        p.id === productId
          ? { ...p, category_id: newCategoryId, categories: allCategories.find(c => c.id === newCategoryId) || null }
          : p
      ));
    } else {
      alert('Failed to update category.');
    }
    setUpdatingId(null);
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    await supabase!.from('products').delete().eq('id', id);
    fetchProductsAndCategories();
  };

  // Client-side filtering: search + category at once
  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategoryId !== 'all') {
      list = list.filter(p => p.category_id === activeCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategoryId, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your catalog, inventory, and categories.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2 w-fit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Category Filter Pills */}
      {!loading && allCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150
              ${activeCategoryId === 'all'
                ? 'bg-gold-600 text-white border-gold-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gold-400 hover:text-gold-700'}`}
          >
            All ({products.length})
          </button>
          {allCategories.map(cat => {
            const count = products.filter(p => p.category_id === cat.id).length;
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150
                  ${isActive
                    ? 'bg-gold-600 text-white border-gold-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gold-400 hover:text-gold-700'}`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-shadow bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <span className="text-sm text-gray-400 shrink-0">
            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-right">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Stock</th>
                <th className="px-6 py-4 font-semibold text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-gray-100 border-t-gold-500 rounded-full animate-spin mb-4" />
                      <p className="text-gray-400 font-medium">Loading inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">No products found</p>
                      <p className="text-sm">
                        {searchQuery ? `No results for "${searchQuery}"` : 'No products in this category.'}
                      </p>
                      {(searchQuery || activeCategoryId !== 'all') && (
                        <button
                          onClick={() => { setSearchQuery(''); setActiveCategoryId('all'); }}
                          className="mt-3 text-gold-600 text-sm font-semibold hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {product.product_images && product.product_images.length > 0 ? (
                          <img
                            src={product.product_images.find(img => img.is_cover)?.image_url || product.product_images[0].image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[8px] text-gray-300 font-bold uppercase">No Img</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-gold-600 transition-colors truncate max-w-[230px]">{product.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5 tracking-wider">{product.id.split('-')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-44">
                    <select
                      value={product.category_id || ''}
                      onChange={e => updateCategory(product.id, e.target.value)}
                      disabled={updatingId === product.id}
                      className={`bg-white border text-xs rounded-lg block w-full px-3 py-2 transition-colors outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500
                        ${updatingId === product.id ? 'opacity-60 cursor-wait' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      <option value="">Uncategorized</option>
                      {allCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-700">₹{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className="font-medium text-gray-700">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center text-sm font-semibold text-gold-600 hover:text-gold-800 transition-colors p-2 rounded-lg hover:bg-gold-50"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteProduct(product.id, product.name)}
                      className="inline-flex items-center text-sm font-semibold text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of <span className="font-semibold text-gray-900">{products.length}</span> products
          </div>
        )}
      </div>
    </div>
  );
}
