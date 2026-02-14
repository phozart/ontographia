import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/perf/PerfWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/perf/PerfContext').then(mod => {
    const { PerfProvider } = mod;
    return {
      default: ({ children }) => <PerfProvider>{children}</PerfProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'perf',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
