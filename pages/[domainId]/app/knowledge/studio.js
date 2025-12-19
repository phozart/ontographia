// pages/[domainId]/app/knowledge/studio.js
import DomainScopedPage from '../../../../components/DomainScopedPage';
import KnowledgeStudioPage from '../../../knowledge-studio';

export default function DomainKnowledgeStudioPage() {
  return (
    <DomainScopedPage>
      <KnowledgeStudioPage />
    </DomainScopedPage>
  );
}
