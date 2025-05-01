import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import { darkTheme, styles } from './styles';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const timestamp = new Date().toISOString();
      await API.post('/register', { username, password, timestamp });
      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed!';
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ ...styles.layout, justifyContent: 'center' }}>
      <Paper sx={styles.authContainer} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" textAlign="center" gutterBottom sx={{ color: '#ffffff' }}>
          Register
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
          Register
        </Button>
        <Typography textAlign="center" marginTop={2} sx={{ color: '#ffffff' }}>
          Already have an account?{' '}
          <Link to="/" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 'bold' }}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Register;
