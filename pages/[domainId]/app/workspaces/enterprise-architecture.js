// pages/[domainId]/app/workspaces/enterprise-architecture.js
import DomainScopedPage from '../../../../components/DomainScopedPage';
import EAStudioPage from '../../../ea-studio';

export default function DomainEAStudioPage() {
  return (
    <DomainScopedPage>
      <EAStudioPage />
    </DomainScopedPage>
  );
}
