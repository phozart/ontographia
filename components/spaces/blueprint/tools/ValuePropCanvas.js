// components/spaces/blueprint/tools/ValuePropCanvas.js
// Value Proposition Canvas - Customer profile + Value map

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CategoryIcon from '@mui/icons-material/Category';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

const EMPTY_CANVAS = {
  customerJobs: [],
  customerPains: [],
  customerGains: [],
  products: [],
  painRelievers: [],
  gainCreators: [],
};

export default function ValuePropCanvas({ onSelectInitiative }) {
  const { initiatives, updateInitiative, activeInitiative } = useBlueprint();

  // Use activeInitiative from context
  const selectedInitiative = activeInitiative;

  // Get canvas data from initiative or use empty
  const canvasData = useMemo(() => {
    return selectedInitiative?.canvases?.valueProp || EMPTY_CANVAS;
  }, [selectedInitiative]);

  const [localData, setLocalData] = useState(canvasData);
  const [hasChanges, setHasChanges] = useState(false);
  const [newItems, setNewItems] = useState({
    customerJobs: '',
    customerPains: '',
    customerGains: '',
    products: '',
    painRelievers: '',
    gainCreators: '',
  });

  // Reset local data when selected initiative changes
  useEffect(() => {
    setLocalData(selectedInitiative?.canvases?.valueProp || EMPTY_CANVAS);
    setHasChanges(false);
  }, [selectedInitiative?.id]);

  // Add item to a section
  const handleAddItem = useCallback((section) => {
    const value = newItems[section]?.trim();
    if (!value) return;

    setLocalData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), { id: Date.now(), text: value }],
    }));
    setNewItems(prev => ({ ...prev, [section]: '' }));
    setHasChanges(true);
  }, [newItems]);

  // Remove item from a section
  const handleRemoveItem = useCallback((section, itemId) => {
    setLocalData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== itemId),
    }));
    setHasChanges(true);
  }, []);

  // Save canvas
  const handleSave = useCallback(async () => {
    if (!selectedInitiative) return;

    try {
      await updateInitiative(selectedInitiative.id, {
        canvases: {
          ...selectedInitiative.canvases,
          valueProp: localData,
        },
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  }, [selectedInitiative, localData, updateInitiative]);

  // No initiative selected
  if (!selectedInitiative) {
    return (
      <div className="canvas-empty">
        <LightbulbIcon />
        <h3>Select an Initiative</h3>
        <p>Choose an initiative from the Initiative Board to work on its Value Proposition Canvas</p>
      </div>
    );
  }

  return (
    <div className="value-prop-canvas">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <LightbulbIcon />
          <div>
            <h2>Value Proposition Canvas</h2>
            <p>{selectedInitiative.display_id}: {selectedInitiative.name}</p>
          </div>
        </div>
        <div className="canvas-header-right">
          {hasChanges && (
            <button className="btn btn-primary" onClick={handleSave}>
              <SaveIcon fontSize="small" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="value-prop-grid">
        {/* Customer Profile (Right side in traditional layout, but we'll do top/bottom) */}
        <div className="value-prop-section value-prop-section--customer">
          <div className="value-prop-section-header">
            <PersonIcon />
            <h3>Customer Profile</h3>
          </div>

          <div className="value-prop-boxes">
            {/* Customer Jobs */}
            <div className="value-prop-box value-prop-box--jobs">
              <div className="value-prop-box-header">
                <WorkIcon />
                <span>Customer Jobs</span>
              </div>
              <p className="value-prop-box-hint">What tasks are customers trying to complete?</p>
              <div className="value-prop-items">
                {localData.customerJobs?.map(item => (
                  <div key={item.id} className="value-prop-item">
                    <span>{item.text}</span>
                    <button
                      className="value-prop-item-delete"
                      onClick={() => handleRemoveItem('customerJobs', item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="value-prop-add">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a customer job..."
                  value={newItems.customerJobs}
                  onChange={(e) => setNewItems(prev => ({ ...prev, customerJobs: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('customerJobs')}
                />
                <button className="btn btn-icon" onClick={() => handleAddItem('customerJobs')}>
                  <AddIcon />
                </button>
              </div>
            </div>

            {/* Customer Pains */}
            <div className="value-prop-box value-prop-box--pains">
              <div className="value-prop-box-header">
                <SentimentDissatisfiedIcon />
                <span>Pains</span>
              </div>
              <p className="value-prop-box-hint">What frustrations or obstacles do they face?</p>
              <div className="value-prop-items">
                {localData.customerPains?.map(item => (
                  <div key={item.id} className="value-prop-item">
                    <span>{item.text}</span>
                    <button
                      className="value-prop-item-delete"
                      onClick={() => handleRemoveItem('customerPains', item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="value-prop-add">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a pain point..."
                  value={newItems.customerPains}
                  onChange={(e) => setNewItems(prev => ({ ...prev, customerPains: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('customerPains')}
                />
                <button className="btn btn-icon" onClick={() => handleAddItem('customerPains')}>
                  <AddIcon />
                </button>
              </div>
            </div>

            {/* Customer Gains */}
            <div className="value-prop-box value-prop-box--gains">
              <div className="value-prop-box-header">
                <EmojiEmotionsIcon />
                <span>Gains</span>
              </div>
              <p className="value-prop-box-hint">What outcomes or benefits do they want?</p>
              <div className="value-prop-items">
                {localData.customerGains?.map(item => (
                  <div key={item.id} className="value-prop-item">
                    <span>{item.text}</span>
                    <button
                      className="value-prop-item-delete"
                      onClick={() => handleRemoveItem('customerGains', item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="value-prop-add">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a desired gain..."
                  value={newItems.customerGains}
                  onChange={(e) => setNewItems(prev => ({ ...prev, customerGains: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('customerGains')}
                />
                <button className="btn btn-icon" onClick={() => handleAddItem('customerGains')}>
                  <AddIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Value Map (Left side traditionally) */}
        <div className="value-prop-section value-prop-section--value">
          <div className="value-prop-section-header">
            <CategoryIcon />
            <h3>Value Map</h3>
          </div>

          <div className="value-prop-boxes">
            {/* Products & Services */}
            <div className="value-prop-box value-prop-box--products">
              <div className="value-prop-box-header">
                <CategoryIcon />
                <span>Products & Services</span>
              </div>
              <p className="value-prop-box-hint">What do you offer?</p>
              <div className="value-prop-items">
                {localData.products?.map(item => (
                  <div key={item.id} className="value-prop-item">
                    <span>{item.text}</span>
                    <button
                      className="value-prop-item-delete"
                      onClick={() => handleRemoveItem('products', item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="value-prop-add">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a product or service..."
                  value={newItems.products}
                  onChange={(e) => setNewItems(prev => ({ ...prev, products: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('products')}
                />
                <button className="btn btn-icon" onClick={() => handleAddItem('products')}>
                  <AddIcon />
                </button>
              </div>
            </div>

            {/* Pain Relievers */}
            <div className="value-prop-box value-prop-box--relievers">
              <div className="value-prop-box-header">
                <MedicalServicesIcon />
                <span>Pain Relievers</span>
              </div>
              <p className="value-prop-box-hint">How do you reduce customer pains?</p>
              <div className="value-prop-items">
                {localData.painRelievers?.map(item => (
                  <div key={item.id} className="value-prop-item">
                    <span>{item.text}</span>
                    <button
                      className="value-prop-item-delete"
                      onClick={() => handleRemoveItem('painRelievers', item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="value-prop-add">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a pain reliever..."
                  value={newItems.painRelievers}
                  onChange={(e) => setNewItems(prev => ({ ...prev, painRelievers: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('painRelievers')}
                />
                <button className="btn btn-icon" onClick={() => handleAddItem('painRelievers')}>
                  <AddIcon />
                </button>
              </div>
            </div>

            {/* Gain Creators */}
            <div className="value-prop-box value-prop-box--creators">
              <div className="value-prop-box-header">
                <AutoAwesomeIcon />
                <span>Gain Creators</span>
              </div>
              <p className="value-prop-box-hint">How do you create customer gains?</p>
              <div className="value-prop-items">
                {localData.gainCreators?.map(item => (
                  <div key={item.id} className="value-prop-item">
                    <span>{item.text}</span>
                    <button
                      className="value-prop-item-delete"
                      onClick={() => handleRemoveItem('gainCreators', item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="value-prop-add">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a gain creator..."
                  value={newItems.gainCreators}
                  onChange={(e) => setNewItems(prev => ({ ...prev, gainCreators: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('gainCreators')}
                />
                <button className="btn btn-icon" onClick={() => handleAddItem('gainCreators')}>
                  <AddIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
