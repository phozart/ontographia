// pages/[domainId]/app/workspaces/portfolio.js
// Domain-scoped Portfolio Studio page

import DomainScopedPage from '../../../../components/DomainScopedPage';
import PortfolioStudioPage from '../../../portfolio-studio';

export default function DomainPortfolioPage() {
  return (
    <DomainScopedPage>
      <PortfolioStudioPage />
    </DomainScopedPage>
  );
}
