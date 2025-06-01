import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import { theme } from './styles/theme.js';
import { AppProviders } from './contexts';
import './index.css';

// Configuration Auth0
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Pour ton API Django
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      cacheLocation={auth0Config.cacheLocation}
      useRefreshTokens={auth0Config.useRefreshTokens}
    >
      <AppProviders>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </AppProviders>
    </Auth0Provider>
  </React.StrictMode>
);