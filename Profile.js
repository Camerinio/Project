import React, { useState, useEffect } from 'react';
import API from '../api';
import { Box, Typography, Avatar, ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, styles } from './styles';
import LeftNavigation from './Navbar';

function Profile() {
  const [profile, setProfile] = useState({});
  const [groupCount, setGroupCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/profile'); // Assuming `/profile` returns user details
        setProfile(response.data);
      } catch (err) {
        alert('Failed to load profile');
      }
    };

    const fetchGroupCount = async () => {
      try {
        const response = await API.get('/groups/count'); // Assuming `/groups/count` returns count
        setGroupCount(response.data.count);
      } catch (err) {
        alert('Failed to load group count');
      }
    };

    fetchProfile();
    fetchGroupCount();
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={styles.layout}>
        <LeftNavigation />
        <Box sx={styles.mainContent}>
          <Box sx={styles.profileCard}>
            <Avatar 
              sx={styles.avatar} 
              src={profile.avatar || '/default-avatar.png'} // Change this if you have a user profile image
            />
            <Typography variant="h5" sx={styles.profileText}>
              {profile.username || 'User'}
            </Typography>
            <Typography variant="body1" sx={styles.profileText}>
              <strong>Created At:</strong>{' '}
              {profile.timestamp ? new Date(profile.timestamp).toLocaleString() : 'Not available'}
            </Typography>
            <Typography variant="body1" sx={styles.profileText}>
              <strong>Groups:</strong> {groupCount || 0}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Profile;
