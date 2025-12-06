import { useState } from 'react';

export default function NodeTypeForm({ onCreated }) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [layer, setLayer] = useState('Information');
  const [color, setColor] = useState('#10b981');
  const [description, setDescription] = useState('');
  const [shape, setShape] = useState('ellipse');

  const shapeOptions = ['ellipse', 'round-rectangle', 'rectangle', 'diamond', 'hexagon'];

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/node-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, label, layer, color, description, shape })
    });
    if (res.ok) {
      setName('');
      setLabel('');
      setDescription('');
      setShape('ellipse');
      if (onCreated) onCreated();
    } else {
      console.error(await res.json());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>Create NodeType</h3>
      <div>
        <label>Name (id)</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Label</label>
        <input value={label} onChange={e => setLabel(e.target.value)} />
      </div>
      <div>
        <label>Layer</label>
        <select value={layer} onChange={e => setLayer(e.target.value)}>
          <option>Physical</option>
          <option>Information</option>
          <option>Systems</option>
          <option>Rules</option>
          <option>Governance</option>
        </select>
      </div>
      <div>
        <label>Color</label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
      </div>
      <div>
        <label>Default shape</label>
        <select value={shape} onChange={e => setShape(e.target.value)}>
          {shapeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <button className="btn" type="submit">Create</button>
    </form>
  );
}
