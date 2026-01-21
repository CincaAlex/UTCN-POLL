import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import './Login.css';



function Login() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Please enter your email';
    else if (!formData.email.includes('@')) newErrors.email = 'Email invalid';

    if (!formData.password) newErrors.password = 'Please enter your password';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const token = data.message; // tokenul e în "message" la tine

        // ✅ VARIANTA 1: nu mai facem fetch la /api/users/...
        // setăm un user minim în context (email) + token
        const minimalUser = {
          email: formData.email,
          name: formData.email,      // fallback ca să nu crape UI-ul pe user.name
          userType: 'USER',          // fallback
        };

      await login(minimalUser, token);
      navigate('/homepage');

      } else {
        setErrors({ form: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ form: 'An error occurred during login.' });
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {errors.form && <div className="error-text general-error">{errors.form}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <span className="label"> Email Address </span>
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
          <span className="label"> Password </span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
          />
          {errors.password && <small className="error-text">{errors.password}</small>}
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
