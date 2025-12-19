// pages/[domainId]/app/workspaces/product-design.js
import DomainScopedPage from '../../../../components/DomainScopedPage';
import ProductDesignPage from '../../../product-design-workspace';

export default function DomainProductDesignPage() {
  return (
    <DomainScopedPage>
      <ProductDesignPage />
    </DomainScopedPage>
  );
}
