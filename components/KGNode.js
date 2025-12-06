// components/KGNode.js
import { Handle, Position } from 'reactflow';

const baseStyle = {
  borderRadius: 12,
  padding: '6px 10px',
  border: '1px solid #6b7280',
  background: 'var(--bg-alt, #e5e7eb)',
  fontSize: 12,
  minWidth: 120,
  textAlign: 'center',
};

export default function KGNode({ data }) {
  return (
    <div style={baseStyle}>
      <Handle id="target-top" type="target" position={Position.Top} style={{ borderRadius: 999 }} />
      <Handle id="target-left" type="target" position={Position.Left} style={{ borderRadius: 999 }} />
      <div>{data.label}</div>
      <Handle id="source-right" type="source" position={Position.Right} style={{ borderRadius: 999 }} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} style={{ borderRadius: 999 }} />
    </div>
  );
}
