// components/pds/tools/LessonsLibrary.js
// Lessons Library Tool - Searchable card gallery
// Phase 5: To be fully implemented

import { useMemo, useState } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, EmptyState, Button, ControlsBar, SearchBox, FilterSelect } from '../../ui';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';

export default function LessonsLibrary({
  onSelectArtefact,
  onCreateArtefact,
}) {
  const { artefacts } = usePDS();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get lessons
  const lessons = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'pds_lesson'),
    [artefacts]
  );

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    lessons.forEach(l => {
      if (l.custom_fields?.category) {
        cats.add(l.custom_fields.category);
      }
    });
    return Array.from(cats);
  }, [lessons]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    let filtered = lessons;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(l => l.custom_fields?.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.name?.toLowerCase().includes(query) ||
        l.custom_fields?.insight?.toLowerCase().includes(query) ||
        l.custom_fields?.recommendation?.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [lessons, categoryFilter, searchQuery]);

  return (
    <div className="pds-view">
      <ViewHeader
        icon={SchoolIcon}
        title="Lessons Library"
        description="Search and browse captured lessons learned"
      />

      <div className="pds-view__content">
        {lessons.length === 0 ? (
          <EmptyState
            icon={SchoolIcon}
            title="No Lessons Captured"
            description="Start capturing lessons learned from your project experiences."
            action={
              <Button variant="primary" onClick={() => onCreateArtefact?.('pds_lesson')}>
                <AddIcon fontSize="small" /> Capture Lesson
              </Button>
            }
          />
        ) : (
          <>
            {/* Search and filter */}
            <ControlsBar>
              <SearchBox
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons..."
              />
              <FilterSelect
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categories.map(c => ({
                  value: c,
                  label: c === 'all' ? 'All Categories' : c,
                }))}
              />
              <Button onClick={() => onCreateArtefact?.('pds_lesson')}>
                <AddIcon fontSize="small" /> New Lesson
              </Button>
            </ControlsBar>

            {/* Results count */}
            <div className="pds-results-count">
              {filteredLessons.length} of {lessons.length} lessons
            </div>

            {/* Lessons grid */}
            {filteredLessons.length > 0 ? (
              <div className="pds-cards-grid">
                {filteredLessons.map(lesson => (
                  <Card
                    key={lesson.id}
                    onClick={() => onSelectArtefact?.(lesson)}
                    className="pds-lesson-card"
                  >
                    <Card.Header>
                      <Card.Title>{lesson.name}</Card.Title>
                      {lesson.custom_fields?.category && (
                        <Card.Badge>{lesson.custom_fields.category}</Card.Badge>
                      )}
                    </Card.Header>
                    <Card.Body>
                      {lesson.custom_fields?.insight && (
                        <p className="pds-lesson-insight">
                          <strong>Insight:</strong> {lesson.custom_fields.insight.substring(0, 150)}
                          {lesson.custom_fields.insight.length > 150 ? '...' : ''}
                        </p>
                      )}
                      {lesson.custom_fields?.recommendation && (
                        <p className="pds-lesson-recommendation">
                          <strong>Recommendation:</strong> {lesson.custom_fields.recommendation.substring(0, 100)}
                          {lesson.custom_fields.recommendation.length > 100 ? '...' : ''}
                        </p>
                      )}
                    </Card.Body>
                    <Card.Footer>
                      {lesson.custom_fields?.applicability?.length > 0 && (
                        <div className="pds-lesson-tags">
                          {lesson.custom_fields.applicability.slice(0, 3).map((tag, i) => (
                            <span key={i} className="pds-lesson-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      {lesson.custom_fields?.wisdom_score && (
                        <div className="pds-lesson-wisdom">
                          <StarIcon fontSize="small" />
                          <span>{lesson.custom_fields.wisdom_score}</span>
                        </div>
                      )}
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SchoolIcon}
                title="No Matching Lessons"
                description="Try adjusting your search or filter criteria."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
