import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthLayout = ({ children, allowedRoles }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole"); // Fetch role from login data
        
        if (token) {
            setIsAuthenticated(true);
            setUserRole(role);
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, [location]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    // 1. Check if logged in
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 2. Check if the Role is allowed (RBAC Logic)
    // If the route has restricted roles and the current user isn't one of them:
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.warn(`Access denied for role: ${userRole}`);
        // Kick them back to dashboard if they try to access /reports unauthorized
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <>
            {children}
        </>
    );
};

export default AuthLayout;
