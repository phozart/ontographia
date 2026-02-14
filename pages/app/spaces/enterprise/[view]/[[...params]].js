import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/enterprise/EnterpriseWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/enterprise/EnterpriseContext').then(mod => {
    const { EnterpriseProvider } = mod;
    return {
      default: ({ children }) => <EnterpriseProvider>{children}</EnterpriseProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'enterprise',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
