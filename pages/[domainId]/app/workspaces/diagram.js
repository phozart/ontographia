// pages/[domainId]/app/workspaces/diagram.js
import DomainScopedPage from '../../../../components/DomainScopedPage';
import DiagramWorkspacePage from '../../../diagram-workspace';

export default function DomainDiagramPage() {
  return (
    <DomainScopedPage>
      <DiagramWorkspacePage />
    </DomainScopedPage>
  );
}
