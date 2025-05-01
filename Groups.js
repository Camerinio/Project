import React, { useState, useEffect } from 'react';
import API from '../api';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Modal,
    TextField,
    ThemeProvider,
    CssBaseline
} from '@mui/material';
import { darkTheme, styles } from './styles';
import LeftNavigation from './Navbar';

function GroupsDashboard() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchGroups(currentPage);
    }, [currentPage]);

    // Fetch groups with pagination
    const fetchGroups = async (page = 1) => {
        try {
            const response = await API.get('/groups', { params: { page, per_page: 10 } });
            setGroups(response.data || []);

            // Handle pagination properly
            const totalItems = parseInt(response.headers['x-total-count'] || '0', 10);
            setTotalPages(totalItems > 0 ? Math.ceil(totalItems / 10) : 1);
            setCurrentPage(page);
        } catch (err) {
            alert('Failed to fetch groups');
        }
    };

    // Fetch group details
    const fetchGroupDetails = async (groupName) => {
        try {
            const response = await API.get(`/groups/${encodeURIComponent(groupName)}`);
            setSelectedGroup(response.data);
        } catch (err) {
            alert('Failed to fetch group details');
        }
    };

    // Fetch restaurants with search and pagination
    const fetchRestaurants = async (page = 1) => {
        try {
            const response = await API.get('/search-restaurants', {
                params: { query: searchQuery, page, limit: 10 },
            });
            setRestaurants(response.data || []);
            const totalItems = response.headers['x-total-count'] || 0;
            setTotalPages(Math.ceil(totalItems / 10));
            setCurrentPage(page);
        } catch (err) {
            alert('Failed to fetch restaurants');
        }
    };

    // Add a restaurant to the group
    const addRestaurantToGroup = async (restaurantName) => {
        if (!selectedGroup) return;
        try {
            await API.put(`/groups/${selectedGroup.name}`, { restaurants: [restaurantName] });
            alert('Restaurant added to the group successfully');
            fetchGroups(currentPage);
        } catch (err) {
            alert('Failed to add restaurant to group');
        }
    };

    // RSVP for a group
    const handleRSVP = async (groupName) => {
        try {
            await API.post('/rsvp', { event_id: groupName, status: true });
            alert('RSVP created successfully');
            fetchGroups(currentPage);
        } catch (err) {
            alert('Failed to RSVP');
        }
    };

    // Delete a group
    const deleteGroup = async (groupName) => {
        try {
            await API.delete(`/groups/${groupName}`);
            alert('Group deleted successfully');
            fetchGroups(currentPage);
        } catch (err) {
            alert('Failed to delete group');
        }
    };

    // Create a new group
    const createGroup = async () => {
        if (!newGroup.name.trim() || !newGroup.description.trim()) {
            alert('Group name and description are required.');
            return;
        }
        try {
            await API.post('/groups', newGroup);
            alert('Group created successfully');
            setOpenCreateModal(false);
            fetchGroups(currentPage);
            setNewGroup({ name: '', description: '' });
        } catch (err) {
            alert('Failed to create group');
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={styles.layout}>
                <LeftNavigation />
                <Box sx={styles.mainContent}>
                    <Typography variant="h4" gutterBottom sx={styles.pageTitle}>
                        Groups Dashboard
                    </Typography>

                    <Button
                        variant="contained"
                        sx={styles.buttonPrimary}
                        onClick={() => setOpenCreateModal(true)}
                    >
                        Create Group
                    </Button>

                    <TableContainer component={Paper} sx={styles.tableContainer}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Group Name</TableCell>
                                    <TableCell>Owner</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groups.map((group, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell
                                            sx={{ cursor: 'pointer', color: 'primary.main' }}
                                            onClick={() => fetchGroupDetails(group.name)}
                                        >
                                            {group.name}
                                        </TableCell>
                                        <TableCell>{group.owner}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                sx={styles.buttonPrimary}
                                                onClick={() => {
                                                    setSelectedGroup(group);
                                                    setOpenAddModal(true);
                                                }}
                                            >
                                                Add Restaurants
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                sx={styles.buttonSecondary}
                                                onClick={() => handleRSVP(group.name)}
                                            >
                                                RSVP
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => deleteGroup(group.name)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <Button variant="outlined" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                            Previous
                        </Button>
                        <Typography sx={{ marginX: 2 }}>
                            Page {currentPage} of {totalPages}
                        </Typography>
                        <Button variant="outlined" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                            Next
                        </Button>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default GroupsDashboard;
