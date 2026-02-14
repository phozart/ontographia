import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/sd/SDWorkspace'),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'sd',
  WorkspaceComponent: Workspace,
});
