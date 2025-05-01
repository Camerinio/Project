import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { darkTheme, styles } from './styles';
import LeftNavigation from './Navbar';

function Dashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  // Fetch restaurants with pagination
  const fetchRestaurants = async (page, query = '') => {
    try {
      const response = await API.get('/restaurants', { params: { page, per_page: 10, query } });

      setRestaurants(response.data || []);

      // Ensure the backend returns a total count for pagination
      const totalItems = parseInt(response.headers['x-total-count'] || '0', 10);
      const calculatedTotalPages = totalItems > 0 ? Math.ceil(totalItems / 10) : 1;

      setTotalPages(calculatedTotalPages);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError('Failed to load restaurants');
    }
  };

  // Fetch data when component loads
  useEffect(() => {
    fetchRestaurants(currentPage);
  }, [currentPage]); // Depend on `currentPage` to refetch when changed

  // Handle Next Page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Handle Previous Page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Handle search and reset to first page
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchRestaurants(1, searchQuery);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={styles.layout}>
        <LeftNavigation />

        <Box sx={styles.mainContent}>
          {/* Title */}
          <Typography variant="h4" gutterBottom sx={{ color: '#ffffff', textAlign: 'center' }}>
            Restaurants Dashboard
          </Typography>

          {/* Search Bar */}
          <Box sx={styles.searchContainer}>
            <TextField
              label="Search by Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ ...styles.inputField, color: '#ffffff' }}
              InputLabelProps={{ style: { color: '#ffffff' } }} // White label
              inputProps={{ style: { color: '#ffffff' } }} // White input text
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Search
            </Button>
          </Box>

          {/* Error Message */}
          {error && <Typography color="error" mb={2} textAlign="center">{error}</Typography>}

          {/* Restaurants Table */}
          <TableContainer component={Paper} sx={styles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  {['Name', 'City', 'Cuisine', 'Rating', 'Price', 'Actions'].map((header) => (
                    <TableCell key={header} sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {restaurants.map((restaurant, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ cursor: 'pointer', color: 'primary.main' }}>
                      {restaurant.Name || 'No name available'}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>{restaurant.City || 'No city available'}</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>{restaurant.Cuisine || 'No cuisine available'}</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>{restaurant.Rating || 'No rating available'}</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>{restaurant.Price || 'No price available'}</TableCell>
                    <TableCell>
                      <Button variant="outlined" color="secondary" sx={{ mr: 1, borderColor: '#ffffff', color: '#ffffff' }}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" sx={{ borderColor: '#ffffff', color: '#ffffff' }}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ ...styles.pagination, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button variant="outlined" sx={{ color: '#ffffff', borderColor: '#ffffff' }} disabled={currentPage === 1} onClick={handlePreviousPage}>
              Previous
            </Button>
            <Typography variant="body1" sx={{ mx: 2 }}>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button variant="outlined" sx={{ color: '#ffffff', borderColor: '#ffffff' }} disabled={currentPage >= totalPages} onClick={handleNextPage}>
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;
