// pages/[domainId]/app/workspaces/requirements.js
import DomainScopedPage from '../../../../components/DomainScopedPage';
import RequirementsStudioPage from '../../../requirements-studio';

export default function DomainRequirementsPage() {
  return (
    <DomainScopedPage>
      <RequirementsStudioPage />
    </DomainScopedPage>
  );
}
