import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

const axiosInstance = axios.create({
    baseURL: 'https://skillbridge-server-zeta.vercel.app/api/v1',
    withCredentials: true,
});

export default axiosInstance;
