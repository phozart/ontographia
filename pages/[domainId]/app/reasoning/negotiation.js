// pages/[domainId]/app/reasoning/negotiation.js
import DomainScopedPage from '../../../../components/DomainScopedPage';
import NegotiationStudioPage from '../../../negotiation-studio';

export default function DomainNegotiationPage() {
  return (
    <DomainScopedPage>
      <NegotiationStudioPage />
    </DomainScopedPage>
  );
}
