import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/blueprint/BlueprintWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/blueprint/BlueprintContext').then(mod => {
    const { BlueprintProvider } = mod;
    return {
      default: ({ children }) => <BlueprintProvider>{children}</BlueprintProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'blueprint',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
