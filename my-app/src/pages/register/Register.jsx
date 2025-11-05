// src/pages/Register.jsx
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
    if (!formData.email) newErrors.email = 'Please insert your email';
    // === Verificare email cu domenii permise ===
    if (!formData.email) {
      newErrors.email = 'Please insert your email';
    } else {
      const emailLower = formData.email.toLowerCase().trim();
      let isValidDomain = false;

      switch (true) {
        case emailLower.endsWith('@student.utcluj.ro'):
        case emailLower.endsWith('@campus.utcluj.ro'):
          isValidDomain = true;
          break;
        default:
          isValidDomain = false;
      }

      if (!emailLower.includes('@')) {
        newErrors.email = 'Email must contain @';
      } else if (!isValidDomain) {
        newErrors.email = 'Email must be from UTCN';
      }
    } if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6)
      newErrors.password = 'Password has to be at least 6 characters long';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      console.log('Data  sent:', formData);
      alert('Registeration successful!');
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2 className="register-form__title text-2xl font-semibold text-center">
        Register
      </h2>

      {/* Name */}
      <div className="register-form__field">
        <label className="register-form__label" htmlFor="name">
          Name:
        </label>
        <input
          id="name"
          type="text"
          name="name"
          className="register-form__input"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
        />
        {errors.name && <p className="register-form__error">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="register-form__field">
        <label className="register-form__label" htmlFor="email">
          Email:
        </label>
        <input
          id="email"
          type="email"
          name="email"
          className="register-form__input"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@domain.com"
        />
        {errors.email && <p className="register-form__error">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="register-form__field">
        <label className="register-form__label" htmlFor="password">
          Password:
        </label>
        <input
          id="password"
          type="password"
          name="password"
          className="register-form__input"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
        />
        {errors.password && (
          <p className="register-form__error">{errors.password}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="register-form__field">
        <label className="register-form__label" htmlFor="confirmPassword">
          Confirm password:
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          className="register-form__input"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && (
          <p className="register-form__error">{errors.confirmPassword}</p>
        )}
      </div>

      <button type="submit" className="register-form__button">
        Register
      </button>
    </form>
  );
}

export default Register;