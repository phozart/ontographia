import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/gtm/GTMWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/gtm/GTMContext').then(mod => {
    const { GTMProvider } = mod;
    return {
      default: ({ children }) => <GTMProvider>{children}</GTMProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'gtm',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
