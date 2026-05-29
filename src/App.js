import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { RewardsDashboard } from "./pages/RewardsDashboard.js";
import "./styles/global.css";

const App = () => (
  <ErrorBoundary>
    <RewardsDashboard />
  </ErrorBoundary>
);

export default App;
