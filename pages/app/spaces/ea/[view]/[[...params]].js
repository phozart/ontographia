import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/ea/GuidedEAWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/ea/EAContext').then(mod => {
    const { EAProvider } = mod;
    return {
      default: ({ children }) => <EAProvider>{children}</EAProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'ea',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
