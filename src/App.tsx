import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Error from "./routes/Error";
import createAPIService from "./services/api_service/service";
import CreateAuthService from "./services/auth/service";
import AuthProvider from "./context_providers/AuthProvider";
import Layout from "./routes/layout/Layout";
import Canvas from "./routes/Canvas";

function App() {
    const apiService = createAPIService();
    const authService = CreateAuthService(apiService);

    return (
        <>
            <AuthProvider authService={authService}>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path=""
                            element={<Layout authService={authService} />}
                        >
                            <Route index element={<Canvas />} />
                            <Route path="error" element={<Error />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </>
    );
}

export default App;
