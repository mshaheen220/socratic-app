

const QuestionStep = ({ label, value, onChange, placeholder }) => (
  <div className="section">
    <label className="section-label">{label}</label>
    <textarea
      rows="3"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default QuestionStep;