// pages/[domainId]/navigation/home.js
// Domain-scoped wrapper for home page

import DomainScopedPage from '../../../components/DomainScopedPage';
import HomePage from '../../home';

export default function DomainHomePage() {
  return (
    <DomainScopedPage>
      <HomePage />
    </DomainScopedPage>
  );
}
