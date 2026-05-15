import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { appTheme } from '../theme/appTheme.js'
import { childrenPropType } from '../types/componentTypes.js'

export const MuiTestWrapper = ({ children }) => (
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
)

MuiTestWrapper.propTypes = {
  children: childrenPropType,
}

MuiTestWrapper.defaultProps = {
  children: null,
}
