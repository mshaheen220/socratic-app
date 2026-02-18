import React from 'react';

/**
 * MultiSelectStep Component
 * 
 * Example Parameters:
 * - label: "Which thinking errors are present?"
 * - options: [
 *     { id: 'ignoring_good', label: 'Ignoring the Good', icon: '/icons/ignoring-good.svg' },
 *     { id: 'blowing_up', label: 'Blowing Things Up' }
 *   ]
 * - value: ['ignoring_good'] (or 'ignoring_good' if singleSelect)
 * - onChange: (newValue) => { ... }
 * - singleSelect: boolean (default false)
 */
const MultiSelectStep = ({ label, options, value, onChange, singleSelect = false }) => {
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
      <div className="selection-grid">
        {options.map((option) => (
          <button 
            key={option.id}
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
        ))}
      </div>
    </div>
  );
};

export default MultiSelectStep;