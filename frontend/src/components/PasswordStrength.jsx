import React from 'react';

const PasswordStrength = ({ password }) => {
  const requirements = [
    {
      id: 'length',
      text: 'At least 6 characters',
      test: (pass) => pass.length >= 6,
    },
    {
      id: 'uppercase',
      text: 'At least one uppercase letter',
      test: (pass) => /[A-Z]/.test(pass),
    },
    {
      id: 'lowercase',
      text: 'At least one lowercase letter',
      test: (pass) => /[a-z]/.test(pass),
    },
    {
      id: 'number',
      text: 'At least one number',
      test: (pass) => /\d/.test(pass),
    },
    {
      id: 'special',
      text: 'At least one special character (!@#$%^&*)',
      test: (pass) => /[!@#$%^&*]/.test(pass),
    },
  ];

  const getStrengthColor = () => {
    const validCount = requirements.filter(req => req.test(password)).length;
    if (validCount <= 2) return '#ff4444';
    if (validCount <= 3) return '#ffaa00';
    if (validCount <= 4) return '#ffff00';
    return '#00ff00';
  };

  const getStrengthText = () => {
    const validCount = requirements.filter(req => req.test(password)).length;
    if (validCount <= 2) return 'Weak';
    if (validCount <= 3) return 'Medium';
    if (validCount <= 4) return 'Strong';
    return 'Very strong';
  };

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div 
          className="strength-fill"
          style={{ 
            width: `${(requirements.filter(req => req.test(password)).length / requirements.length) * 100}%`,
            backgroundColor: getStrengthColor()
          }}
        />
      </div>
      <div className="strength-text" style={{ color: getStrengthColor() }}>
        {getStrengthText()}
      </div>
      
      <div className="requirements-list">
        {requirements.map(req => (
          <div key={req.id} className={`requirement ${req.test(password) ? 'valid' : 'invalid'}`}>
            <span className="requirement-icon">
              {req.test(password) ? '✅' : '❌'}
            </span>
            <span className="requirement-text">{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;