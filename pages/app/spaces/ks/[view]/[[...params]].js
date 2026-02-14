import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/ks/KSWorkspace'),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'ks',
  WorkspaceComponent: Workspace,
});
