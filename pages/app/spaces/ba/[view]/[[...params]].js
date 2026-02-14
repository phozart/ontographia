import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/ba/BAWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/ba/BAContext').then(mod => {
    const { BAProvider } = mod;
    return {
      default: ({ children }) => <BAProvider>{children}</BAProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'ba',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
