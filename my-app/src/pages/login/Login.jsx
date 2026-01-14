import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import './Login.css';

// 1. DEFINE ADMIN EMAILS
// In a real application, this list would come from a secure API endpoint.
const ADMIN_EMAILS = [
    'admin@utcn.ro',
    'admin@campus.utcluj.ro',
    'another.admin@utcn.ro',
];

function Login() {
  const navigate = useNavigate();
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
      
      // *** 2. DETERMINE USER ROLE BASED ON EMAIL ***
      const enteredEmail = formData.email.toLowerCase();
      const userRole = ADMIN_EMAILS.includes(enteredEmail) ? 'admin' : 'user';

      try {
        // In a real app, you would send formData to the API. 
        // Here, we simulate success and pass the determined role.
        
        // 1. Simulate API call/Login action and pass the role
        await login(userRole); 
        
        // 2. Navigate to the desired page after successful login
        // You might want to navigate to a different page based on the role here!
        navigate('/homepage');
        
      } catch (error) {
        // This catch block handles errors thrown by the simulated `login` function
        console.error("Login failed:", error);
        setErrors(prev => ({ ...prev, general: 'Login failed. Please check your credentials.' }));
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