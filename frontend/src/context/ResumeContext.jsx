import { Children, createContext, useState } from 'react';
import axiosInstance from '../axiosInstance';

export const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
    const [resume, setResume] = useState([]);

    const fetchResume = async () => {
        try {
            const res = await axiosInstance.get(`/resume/`);
            setResume(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <ResumeContext.Provider value={{ resume, fetchResume }}>{children}</ResumeContext.Provider>
    );
};
