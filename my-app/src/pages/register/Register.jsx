import { useState } from 'react';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Please insert your name';
    
    if (!formData.email) {
      newErrors.email = 'Please insert your email';
    } else {
      const emailLower = formData.email.toLowerCase().trim();
      const isValidDomain =
        emailLower.endsWith('@student.utcluj.ro') ||
        emailLower.endsWith('@campus.utcluj.ro');

      if (!emailLower.includes('@')) {
        newErrors.email = 'Email must contain @';
      } else if (!isValidDomain) {
        newErrors.email = 'Email must be from UTCN';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password has to be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      console.log('Data sent:', formData);
      alert('Registration successful!');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="input-group">
          <label className="label">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error-input" : ""}
          />
          {errors.name && <small className="error-text">{errors.name}</small>}
        </div>

        <div className="input-group">
          <label className="label">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
          />
          {errors.email && <small className="error-text">{errors.email}</small>}
        </div>

        <div className="input-group">
          <label className="label">Password</label>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
          />
          {errors.password && <small className="error-text">{errors.password}</small>}
        </div>

        <div className="input-group">
          <label className="label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "error-input" : ""}
          />
          {errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
        </div>

        <button type="submit" className="register-btn">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
