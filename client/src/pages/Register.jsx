import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const register = async () => {
    try {
        // Register user
      await axios.post('http://localhost:5000/api/auth/register', { username, password });
      alert('Registration successful! Please login.');
      
    //     // Auto-login
    //   const { data } = await axios.post('http://localhost:5000/api/auth/login', { username, password });
    //   localStorage.setItem('token', data.token); 

      navigate('/');
    } catch (err) {
      setError('Username already taken or registration failed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-80 p-6 border rounded shadow">
        <h2 className="text-xl font-bold mb-4">Register</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={register} className="w-full bg-green-600 text-white py-2 rounded mb-3">
          Register
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Link to="/" className="text-blue-500 text-sm underline">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}
