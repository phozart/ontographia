import dynamic from 'next/dynamic';

const GraphView = dynamic(() => import('../components/GraphView'), {
  ssr: false
});

export default function GraphPage() {
  return (
    <div>
      <h2>Graph</h2>
      <GraphView />
    </div>
  );
}
