import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { products, formatCategory } from '../../data/products'
import { useState } from 'react'

export default function ClientProducts() {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'skin_sub' | 'collagen'>('all')

  const filtered = products.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter,
  )

  const skinSubs = products.filter((p) => p.category === 'skin_sub')
  const collagen = products.filter((p) => p.category === 'collagen')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Available Products"
        description="Skin substitutes and collagen products available for your facility."
        action={{ label: 'Place Order', to: '/order' }}
      />

      <div className="flex gap-2 mb-6">
        {(['all', 'skin_sub', 'collagen'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? `All (${products.length})` : cat === 'skin_sub' ? `Skin Substitutes (${skinSubs.length})` : `Collagen (${collagen.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-brand-200 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{product.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {formatCategory(product.category)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{product.sku} · {product.manufacturer}</p>
            </div>
            <p className="text-sm text-slate-600 mt-3">{product.description}</p>
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500 mb-1.5">Available Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((size) => (
                  <span key={size} className="text-xs px-2 py-1 bg-brand-50 text-brand-700 rounded-md border border-brand-100">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/order" className="inline-flex px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700">
          Order Products
        </Link>
      </div>
    </div>
  )
}
