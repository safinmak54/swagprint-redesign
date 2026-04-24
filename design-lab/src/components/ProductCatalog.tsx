import { useStore, catalog } from '../store'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function ProductCatalog({ isOpen, onClose }: Props) {
  const selectProduct = useStore(s => s.selectProduct)
  const currentProduct = useStore(s => s.product)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={onClose}>
      <div
        className="bg-surface-container-low border border-outline rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-ambient-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-outline">
          <h2 className="font-display text-lg font-bold text-on-surface">Select Product</h2>
          <p className="text-on-surface-variant text-xs mt-1">Choose a product to customize in the Design Lab</p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          {catalog.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                selectProduct(product.id)
                onClose()
              }}
              className={`text-left p-4 rounded-lg border transition-all hover:shadow-ambient ${
                currentProduct.id === product.id
                  ? 'border-primary bg-primary/5'
                  : 'border-outline hover:border-on-surface-variant/30'
              }`}
            >
              <div className="text-3xl mb-2 opacity-40">
                {product.category === 'apparel' ? '👕' : product.category === 'accessories' ? '🏷️' : product.category === 'bags' ? '👜' : '🏷️'}
              </div>
              <h3 className="font-display text-sm font-bold text-on-surface">{product.name}</h3>
              <p className="text-on-surface-variant text-[10px] mt-0.5">{product.description}</p>
              <p className="text-primary text-xs font-bold mt-2">
                From ${product.basePrice.toFixed(2)}
              </p>
              <div className="flex gap-1 mt-2">
                {product.tags.map(tag => (
                  <span key={tag} className="text-[8px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
