// pages/[domainId]/app/reasoning/system-dynamics.js
import DomainScopedPage from '../../../../components/DomainScopedPage';
import SystemDynamicsPage from '../../../system-dynamics';

export default function DomainSystemDynamicsPage() {
  return (
    <DomainScopedPage>
      <SystemDynamicsPage />
    </DomainScopedPage>
  );
}
