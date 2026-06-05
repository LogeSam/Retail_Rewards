import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { RewardsDashboard } from "./pages/RewardsDashboard.js";
import "./styles/global.css";

const App = () => (
  <ErrorBoundary resetKeys={[window.location.pathname]}>
    <main>
      <RewardsDashboard />
    </main>
  </ErrorBoundary>
);

export default App;
