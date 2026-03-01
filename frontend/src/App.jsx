import { useContext, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './pages/ProtectedRoute.jsx';
import ConfirmResume from './pages/ConfirmResume.jsx';
import { Toaster } from 'sonner';
import Resume from './pages/Resume.jsx';
import Forgetpassw from './pages/Forgetpassw.jsx';
import Resetpassw from './pages/Resetpassw.jsx';
import Contact from './pages/Contact.jsx';
import Opportunities from './pages/Opportunities.jsx';
import Report from './pages/Report.jsx';
import Roadmap from './pages/Roadmap.jsx';
import CompletedRoadmap from './pages/CompletedRoadmap';
import Developer from './pages/Developer';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Logger from './pages/Logger.jsx';
import AllUsers from './pages/AllUsers.jsx';
import AccountSuspended from './pages/AccountSuspended.jsx';
import SetTarget from './pages/SetTarget.jsx';
import { getThemeColors } from './theme';
import { AuthContext } from './context/AuthContext.jsx';
import AuthLoader from './components/AuthLoader.jsx';



function App() {
    const {user,loading} = useContext(AuthContext)
    const {colors} = getThemeColors(user?.theme || 'light');

    if(loading){
        return <AuthLoader/>
    }
    
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: colors.bgLight }}
        >
            <Navbar />
            <Toaster duration={2000} richColors position="top-center" />
            <main className="no-scrollbar overflow-y-auto h-screen pt-30">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgetpassword" element={<Forgetpassw />} />
                    <Route path="/reset-password/:token" element={<Resetpassw />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/developer" element={<Developer />} />
                    <Route path="/account-suspended" element={<AccountSuspended />} />
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/adminDashboard" element={<AdminDashboard />} />
                        <Route path="/logger" element={<Logger />} />
                        <Route path="/users" element={<AllUsers />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/resume" element={<Resume />} />
                        <Route path="/opportunities" element={<Opportunities />} />
                        <Route path="/analyze/:opportunityId" element={<Report />} />
                        <Route path="/roadmap/:id" element={<Roadmap />} />
                        <Route path="/set-target" element={<SetTarget />} />
                        <Route path="/complete_roadmap" element={<CompletedRoadmap />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Routes>
                <Footer />
            </main>
        </div>
    );
}

export default App;
