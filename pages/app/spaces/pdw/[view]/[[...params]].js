import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/pdw/PDWWorkspace'),
  { ssr: false }
);

const Provider = dynamic(
  () => import('@/components/spaces/pdw/PDWContext').then(mod => {
    const { PDWProvider } = mod;
    return {
      default: ({ children }) => <PDWProvider>{children}</PDWProvider>,
    };
  }),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'pdw',
  WorkspaceComponent: Workspace,
  ProviderComponent: Provider,
});
