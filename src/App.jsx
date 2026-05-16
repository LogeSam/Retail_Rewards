import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { RewardsDashboard } from "./pages/RewardsDashboard.jsx";
import "./styles/global.css";

const App = () => (
  <ErrorBoundary>
    <RewardsDashboard />
  </ErrorBoundary>
);

export default App;
