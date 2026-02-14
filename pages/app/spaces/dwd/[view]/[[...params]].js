import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/dwd/DWDWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/dwd/DWDContext').then(mod => {
    const { DWDProvider } = mod;
    return {
      default: ({ children }) => <DWDProvider>{children}</DWDProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'dwd',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
