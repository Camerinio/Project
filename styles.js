import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: {
      default: '#1a1a1a', // Dark mode background
      paper: '#232323', // Lighter for containers
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  shape: { borderRadius: 12 },
});

export const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
    backgroundColor: darkTheme.palette.background.default,
  },
  sidebar: {
    width: 250,
    backgroundColor: '#121212',
    padding: '20px 15px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    color: darkTheme.palette.text.primary,
    boxShadow: '2px 0px 10px rgba(0,0,0,0.2)',
  },
  mainContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px',
    minHeight: '100vh',
    overflowY: 'auto',
  },

  /* ✅ Groups Page - Fixed Alignment */
  groupsContainer: {
    width: '80%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: '20px',
  },
  groupsTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: darkTheme.palette.text.primary,
    marginBottom: '16px',
    textAlign: 'center',
  },
  createGroupButton: {
    backgroundColor: darkTheme.palette.primary.main,
    padding: '10px 18px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '8px',
    '&:hover': { backgroundColor: darkTheme.palette.primary.light },
    marginBottom: '20px',
    alignSelf: 'flex-end', // ✅ Align button to right
  },

  /* ✅ Table Fixes */
  groupsTableContainer: {
    width: '100%',
    backgroundColor: darkTheme.palette.background.paper,
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: darkTheme.palette.text.primary,
    textAlign: 'left', // ✅ Ensures headers align properly
    padding: '12px 16px',
  },
  tableCell: {
    padding: '12px 16px',
    textAlign: 'left', // ✅ Fixes column text alignment
  },

  /* ✅ Scrollbar Fix */
  scrollbar: {
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-thumb': {
      background: '#3d3d3d',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': { background: '#5c5c5c' },
    '&::-webkit-scrollbar-track': { background: '#1a1a1a' },
  },

  /* ✅ Register & Login Styling */
  authContainer: {
    padding: '24px',
    backgroundColor: darkTheme.palette.background.paper,
    borderRadius: '12px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    minWidth: '350px',
    textAlign: 'center',
  },

  /* ✅ White Input Fields for Forms */
  inputFieldLight: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff', // White background
      borderRadius: '12px',
      '& fieldset': { borderColor: darkTheme.palette.text.secondary },
      '&:hover fieldset': { borderColor: darkTheme.palette.primary.main },
      '&.Mui-focused fieldset': { borderColor: darkTheme.palette.primary.main },
    },
  },

  buttonPrimary: {
    backgroundColor: darkTheme.palette.primary.main,
    color: darkTheme.palette.text.primary,
    padding: '12px 16px',
    borderRadius: 12,
    '&:hover': { backgroundColor: darkTheme.palette.primary.light },
  },
};
