import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./utils/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";

const App = () => {
  return (
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorBoundary>
  );
};

export default App;
