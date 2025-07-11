import React from 'react';

const PasswordStrength = ({ password }) => {
  const requirements = [
    {
      id: 'length',
      text: 'حداقل 6 کاراکتر',
      test: (pass) => pass.length >= 6,
    },
    {
      id: 'uppercase',
      text: 'حداقل یک حرف بزرگ',
      test: (pass) => /[A-Z]/.test(pass),
    },
    {
      id: 'lowercase',
      text: 'حداقل یک حرف کوچک',
      test: (pass) => /[a-z]/.test(pass),
    },
    {
      id: 'number',
      text: 'حداقل یک عدد',
      test: (pass) => /\d/.test(pass),
    },
    {
      id: 'special',
      text: 'حداقل یک کاراکتر خاص (!@#$%^&*)',
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
    if (validCount <= 2) return 'ضعیف';
    if (validCount <= 3) return 'متوسط';
    if (validCount <= 4) return 'قوی';
    return 'خیلی قوی';
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