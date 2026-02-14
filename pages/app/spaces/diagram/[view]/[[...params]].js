import dynamic from 'next/dynamic';
import { createSpacePage } from '@/components/spaces/SpacePageFactory';

const Workspace = dynamic(
  () => import('@/components/spaces/diagram-studio/DiagramStudioSpace'),
  { ssr: false }
);

export default createSpacePage({
  spaceCode: 'diagram',
  WorkspaceComponent: Workspace,
});
