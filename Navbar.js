import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Dashboard, Person, Group, Logout } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { styles, darkTheme } from './styles'; // Import new styles

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: styles.sidebar.width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: styles.sidebar.width,
                    backgroundColor: darkTheme.palette.background.paper,
                    color: darkTheme.palette.text.primary,
                    paddingTop: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: styles.sidebar.borderRadius,
                },
            }}
        >
            <Box sx={{ textAlign: 'center', my: 2 }}>
                <img src="logo.png" alt="NghtOut Logo" width="100" style={{ borderRadius: '50%' }} />
                <ListItemText primary="NghtOut" sx={{ fontSize: '1.5rem', fontWeight: 'bold', mt: 1 }} />
            </Box>


            <List sx={{ width: '100%' }}>
                {/* Dashboard */}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dashboard" sx={styles.sidebarButton}>
                        <ListItemIcon>
                            <Dashboard sx={{ color: darkTheme.palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>

                {/* Profile */}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/profile" sx={styles.sidebarButton}>
                        <ListItemIcon>
                            <Person sx={{ color: darkTheme.palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItemButton>
                </ListItem>

                {/* Groups */}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/groups" sx={styles.sidebarButton}>
                        <ListItemIcon>
                            <Group sx={{ color: darkTheme.palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText primary="Groups" />
                    </ListItemButton>
                </ListItem>

                {/* Logout */}
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} sx={styles.sidebarButton}>
                        <ListItemIcon>
                            <Logout sx={{ color: darkTheme.palette.secondary.main }} />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
}

export default Navbar;
