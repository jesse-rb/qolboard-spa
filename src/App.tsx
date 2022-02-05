import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/register/Register';
import Layout from './components/layout/Layout';

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/register' element={<Layout><Register /></Layout>} />
                <Route path='/' element={<Layout><h1>index</h1></Layout>} />
            </Routes>
        </Router>
    )
}

export default App;  
