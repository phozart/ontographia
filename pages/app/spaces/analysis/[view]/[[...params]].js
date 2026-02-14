import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/analysis/AnalysisWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/analysis/AnalysisContext').then(mod => {
    const { AnalysisProvider } = mod;
    return {
      default: ({ children }) => <AnalysisProvider>{children}</AnalysisProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'analysis',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
