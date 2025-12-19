// pages/[domainId]/navigation/projects-overview.js
import DomainScopedPage from '../../../components/DomainScopedPage';
import ProjectsOverviewPage from '../../projects-overview';

export default function DomainProjectsOverviewPage() {
  return (
    <DomainScopedPage>
      <ProjectsOverviewPage />
    </DomainScopedPage>
  );
}
