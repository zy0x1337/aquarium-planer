import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import MainLayout from './components/layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AquariumDesigner from './pages/AquariumDesigner';
import DatabaseBrowser from './pages/DatabaseBrowser';
import ProjectList from './components/projects/ProjectList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#4CAF50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectList />} /> {/* ← WICHTIG */}
              <Route path="/designer" element={<AquariumDesigner />} />
              <Route path="/database" element={<DatabaseBrowser />} />
            </Routes>
          </MainLayout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
