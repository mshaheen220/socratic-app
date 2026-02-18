import React from 'react';
import Tooltip from './Tooltip';

/**
 * MultiSelectStep Component
 * 
 * Example Parameters:
 * - label: "Which thinking errors are present?"
 * - description: "Select all that apply."
 * - options: [
 *     { id: 'ignoring_good', label: 'Ignoring the Good', icon: '/icons/ignoring-good.svg' },
 *     { id: 'blowing_up', label: 'Blowing Things Up' }
 *   ]
 * - value: ['ignoring_good'] (or 'ignoring_good' if singleSelect)
 * - onChange: (newValue) => { ... }
 * - singleSelect: boolean (default false)
 */
const MultiSelectStep = ({ label, description, options, value, onChange, singleSelect = false }) => {
  const handleSelect = (id) => {
    if (singleSelect) {
      onChange(id);
    } else {
      const safeValue = Array.isArray(value) ? value : [];
      const updated = safeValue.includes(id)
        ? safeValue.filter(item => item !== id)
        : [...safeValue, id];
      onChange(updated);
    }
  };

  return (
    <div className="section">
      <p className="section-label">{label}</p>
      {description && <p className="section-description">{description}</p>}
      <div className="selection-grid">
        {options.map((option) => (
          <Tooltip key={option.id} text={option.description}>
            <button 
              onClick={() => handleSelect(option.id)}
              className={`toggle-btn ${
                (singleSelect ? value === option.id : value?.includes(option.id)) 
                  ? 'selected' 
                  : ''
              }`}
            >
              {/* {option.icon && <img src={option.icon} alt="" className="option-icon" />} */}
              {option.label}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default MultiSelectStep;