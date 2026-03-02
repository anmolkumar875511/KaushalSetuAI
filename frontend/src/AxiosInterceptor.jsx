import { useContext, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from './axiosInstance';
import { AuthContext } from './context/AuthContext';

const AxiosInterceptor = ({ children }) => {
  const { user, loading, setUser } = useContext(AuthContext);

  useEffect(() => {
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 🔥 1. Ignore auth-init request (first app load)
        if (originalRequest?._authInit) {
          return Promise.reject(error);
        }

        // 🔥 2. Ignore auth routes completely
        const authFreeRoutes = [
          '/user/login',
          '/user/register',
          '/user/refresh-token',
        ];

        if (authFreeRoutes.some((route) => originalRequest.url?.includes(route))) {
          return Promise.reject(error);
        }

        // 🔥 3. If auth still loading OR user not logged in → do nothing
        if (loading || !user) {
          return Promise.reject(error);
        }

        // 🔁 4. Refresh token logic
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await axios.post(
              'https://kaushal-setu-ai-yy8y.vercel.app/api/v1/user/refresh-token',
              {},
              { withCredentials: true }
            );

            // Retry original request
            return axiosInstance(originalRequest);  
          } catch (refreshError) {
            console.error('Refresh token failed', refreshError);

            // 🔥 Logout on refresh failure
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axiosInstance.interceptors.response.eject(responseInterceptor);
  }, [user, loading, setUser]);

  return children;
};

export default AxiosInterceptor;

