import { useState } from 'react';
import './Login.css'; // opțional pentru stiluri

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Please enter your email';
    if (!formData.email.includes('@')) newErrors.email = 'Email invalid';
    if (!formData.password) newErrors.password = 'Please enter your password';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      console.log('Date trimise:', formData);
      alert('Înregistrare reușită! (simulare)');
      // Aici vei trimite datele către backend mai târziu
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
    
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;