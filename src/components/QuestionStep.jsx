import React from 'react';

const QuestionStep = ({ label, value, onChange, placeholder }) => (
  <div className="mb-6">
    <label className="block text-gray-700 font-bold mb-2">{label}</label>
    <textarea
      className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
      rows="3"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default QuestionStep;