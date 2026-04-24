import { useEffect } from 'react'
import { DesignLab } from './components/DesignLab'
import { DesignOnlyStudio } from './components/DesignOnlyStudio'
import { MinViewportGate } from './components/MinViewportGate'
import { useStore } from './store'

function App() {
  const selectProduct = useStore(s => s.selectProduct)
  const addColorOrder = useStore(s => s.addColorOrder)

  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')

  // Initialize from URL params (e.g., ?product=custom-lanyard&color=Black&quantity=100)
  useEffect(() => {
    const productId = params.get('product')
    const color = params.get('color')

    if (productId) selectProduct(productId)
    if (color) addColorOrder(color)
  }, [selectProduct, addColorOrder])

  return (
    <MinViewportGate minWidth={1024}>
      {mode === 'design-only' ? <DesignOnlyStudio /> : <DesignLab />}
    </MinViewportGate>
  )
}

export default App
