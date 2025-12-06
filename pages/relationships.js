import RelationshipTable from '../components/RelationshipTable';
import RelationshipFormDialog from '../components/RelationshipFormDialog';
import { useState } from 'react';

export default function RelationshipsPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Relationships</h2>
        <button className="btn" onClick={() => setFormOpen(true)}>+ New relationship</button>
      </div>
      <RelationshipTable onChanged={() => setReloadKey(k => k + 1)} reloadKey={reloadKey} hideCreate />
      <RelationshipFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          setReloadKey(k => k + 1);
        }}
      />
    </div>
  );
}
