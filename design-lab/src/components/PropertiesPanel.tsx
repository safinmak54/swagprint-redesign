import type { CanvasObjectData } from '../hooks/useCanvas'

const FONTS = ['Plus Jakarta Sans', 'Inter', 'Arial', 'Georgia', 'Courier New']
const COLORS = ['#ffffff', '#000000', '#001f9d', '#C0392B', '#27AE60', '#F39C12', '#8E44AD', '#1ABC9C']

interface Props {
  selected: CanvasObjectData
  onUpdate: (id: string, props: Record<string, unknown>) => void
  onDelete: () => void
}

export function PropertiesPanel({ selected, onUpdate, onDelete }: Props) {
  const update = (props: Record<string, unknown>) => onUpdate(selected.id, props)

  return (
    <div className="absolute top-3 right-3 w-56 bg-surface-container-lowest/95 backdrop-blur-md border border-outline rounded-xl shadow-ambient-lg z-20 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-outline">
        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
          {selected.type === 'text' ? 'Text' : 'Image'} Properties
        </span>
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5 rounded hover:bg-red-400/10 transition-colors"
          title="Delete object"
        >
          Delete
        </button>
      </div>

      <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
        {selected.type === 'text' && (
          <>
            <Field label="Text">
              <input
                type="text"
                value={selected.text ?? ''}
                onChange={(e) => update({ text: e.target.value })}
                className="w-full bg-surface-container text-on-surface text-xs px-2 py-1.5 rounded border border-outline focus:border-primary outline-none"
              />
            </Field>

            <Field label="Font">
              <select
                value={selected.fontFamily ?? 'Plus Jakarta Sans'}
                onChange={(e) => update({ fontFamily: e.target.value })}
                className="w-full bg-surface-container text-on-surface text-xs px-2 py-1.5 rounded border border-outline focus:border-primary outline-none"
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>

            <div className="flex gap-2">
              <Field label="Size" className="flex-1">
                <input
                  type="number"
                  min={8}
                  max={120}
                  value={selected.fontSize ?? 24}
                  onChange={(e) => update({ fontSize: parseInt(e.target.value) || 24 })}
                  className="w-full bg-surface-container text-on-surface text-xs px-2 py-1.5 rounded border border-outline focus:border-primary outline-none"
                />
              </Field>
              <Field label="Style" className="flex-shrink-0">
                <div className="flex gap-1">
                  <button
                    onClick={() => update({ fontWeight: selected.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                      selected.fontWeight === 'bold'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant border border-outline hover:border-primary/30'
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() => update({ fontStyle: selected.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`w-7 h-7 rounded text-xs italic transition-colors ${
                      selected.fontStyle === 'italic'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant border border-outline hover:border-primary/30'
                    }`}
                  >
                    I
                  </button>
                </div>
              </Field>
            </div>

            <Field label="Align">
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => update({ textAlign: align })}
                    className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                      selected.textAlign === align
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant border border-outline hover:border-primary/30'
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Color">
              <div className="flex gap-1 flex-wrap">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => update({ fill: color })}
                    className={`w-5 h-5 rounded-full transition-all ${
                      selected.fill === color
                        ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface-container-lowest'
                        : 'hover:ring-1 hover:ring-on-surface-variant/30'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={selected.fill ?? '#ffffff'}
                  onChange={(e) => update({ fill: e.target.value })}
                  className="w-5 h-5 rounded-full cursor-pointer border-0 p-0"
                  title="Custom color"
                />
              </div>
            </Field>
          </>
        )}

        {selected.type === 'image' && (
          <Field label="Opacity">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selected.opacity ?? 1}
              onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-primary"
            />
            <span className="text-[10px] text-on-surface-variant">{Math.round((selected.opacity ?? 1) * 100)}%</span>
          </Field>
        )}

        <div className="flex gap-2">
          <Field label="X" className="flex-1">
            <input
              type="number"
              value={selected.x}
              onChange={(e) => update({ left: parseInt(e.target.value) || 0 })}
              className="w-full bg-surface-container text-on-surface text-xs px-2 py-1.5 rounded border border-outline focus:border-primary outline-none"
            />
          </Field>
          <Field label="Y" className="flex-1">
            <input
              type="number"
              value={selected.y}
              onChange={(e) => update({ top: parseInt(e.target.value) || 0 })}
              className="w-full bg-surface-container text-on-surface text-xs px-2 py-1.5 rounded border border-outline focus:border-primary outline-none"
            />
          </Field>
        </div>

        <Field label="Rotation">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={360}
              value={selected.angle ?? 0}
              onChange={(e) => update({ angle: parseInt(e.target.value) })}
              className="flex-1 accent-primary"
            />
            <span className="text-[10px] text-on-surface-variant w-8 text-right">{selected.angle ?? 0}deg</span>
          </div>
        </Field>
      </div>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium mb-1 block">
        {label}
      </label>
      {children}
    </div>
  )
}
