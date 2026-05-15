import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { RewardsDashboard } from './pages/RewardsDashboard.jsx'
import { appTheme } from './theme/appTheme.js'
import './styles/global.css'

const App = () => (
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
    <ErrorBoundary>
      <RewardsDashboard />
    </ErrorBoundary>
  </ThemeProvider>
)

export default App
