import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  // Access the login function from UserContext
  const { login } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Please enter your password';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      setIsSubmitting(true);
      console.log('Data sent:', formData);
      
      try {
        // 1. Simulate API call/Login action
        await login(); 
        
        // 2. Navigate to the desired page after successful login
        navigate('/homepage');
        
      } catch (error) {
        // In a real app, handle API errors here
        console.error("Login failed:", error);
        // Set a general error state if login fails
        setErrors(prev => ({ ...prev, general: 'Login failed. Please try again.' }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errors.general && <div className="error-text general-error">{errors.general}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <span className = 'label'> Email Address </span>
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
          <span className = "label"> Password </span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
          />
          {errors.password && <small className="error-text">{errors.password}</small>}
        </div>

        <button type="submit" className="login-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Logging In...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;