import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import { theme as muiTheme } from './styles/theme.js'
import { AppProviders } from './contexts/index.jsx'

// Configuration Auth0
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Pour mon API Django
    scope: import.meta.env.VITE_AUTH0_SCOPE 
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
}

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
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <App />
        </MuiThemeProvider>
      </AppProviders>
    </Auth0Provider>
  </React.StrictMode>
)