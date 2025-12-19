// pages/[domainId]/app/workspaces/change-management.js
// Change Management Studio workspace page - Domain scoped

import DomainScopedPage from '../../../../components/DomainScopedPage';
import ChangeManagementBase from '../../../change-management';

export default function DomainChangeManagementPage() {
  return (
    <DomainScopedPage>
      <ChangeManagementBase />
    </DomainScopedPage>
  );
}
