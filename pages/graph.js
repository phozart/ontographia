import nextDynamic from 'next/dynamic';

const GraphView = nextDynamic(() => import('../components/GraphView'), {
  ssr: false
});

export async function getServerSideProps() {
  return { props: {} };
}

export default function GraphPage() {
  return (
    <div>
      <h2>Graph</h2>
      <GraphView />
    </div>
  );
}
