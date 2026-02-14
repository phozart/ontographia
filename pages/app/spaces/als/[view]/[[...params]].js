import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/als/ALSWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/als/ALSContext').then(mod => {
    const { ALSProvider } = mod;
    return {
      default: ({ children }) => <ALSProvider>{children}</ALSProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'als',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
