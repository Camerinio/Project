import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import { darkTheme, styles } from './styles';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/login', { username, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed!');
    }
  };

  return (
    <Box sx={{ ...styles.layout, justifyContent: 'center' }}>
      <Paper sx={styles.authContainer} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" textAlign="center" gutterBottom sx={{ color: '#ffffff' }}>
          Login
        </Typography>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          sx={styles.inputFieldLight}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={styles.inputFieldLight}
        />
        <Button type="submit" variant="contained" fullWidth sx={styles.buttonPrimary}>
          LOGIN
        </Button>
        <Typography textAlign="center" marginTop={2} sx={{ color: '#ffffff' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 'bold' }}>
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
