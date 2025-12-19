// pages/[domainId]/app/knowledge/studio/graph-navigator.js
import DomainScopedPage from '../../../../../components/DomainScopedPage';
import GraphNavigatorPage from '../../../../graphnavigator';

export default function DomainGraphNavigatorPage() {
  return (
    <DomainScopedPage>
      <GraphNavigatorPage />
    </DomainScopedPage>
  );
}
