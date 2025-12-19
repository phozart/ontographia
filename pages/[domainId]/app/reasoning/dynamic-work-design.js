// pages/[domainId]/app/reasoning/dynamic-work-design.js
import DomainScopedPage from '../../../../components/DomainScopedPage';
import DynamicWorkDesignPage from '../../../dynamic-work-design';

export default function DomainDynamicWorkDesignPage() {
  return (
    <DomainScopedPage>
      <DynamicWorkDesignPage />
    </DomainScopedPage>
  );
}
