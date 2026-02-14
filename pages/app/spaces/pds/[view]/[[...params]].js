import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/pds/PDSWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/pds/PDSContext').then(mod => {
    const { PDSProvider } = mod;
    return {
      default: ({ children }) => <PDSProvider>{children}</PDSProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'pds',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
