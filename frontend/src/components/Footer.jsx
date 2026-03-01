import React, { useContext } from 'react';
import logo from '../assets/logo.png';
import { AuthContext } from '../context/AuthContext';
import { getThemeColors } from '../theme';

const Footer = () => {
    const {user} = useContext(AuthContext)
    const { colors } = getThemeColors(user?.theme || 'light');
    return (
        <footer className="w-full  border-t border-gray-100 mt-10"
        style={{backgroundColor: colors.bglight}}>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between gap-12">
                    <div className="md:w-1/3 space-y-6">
                        <img
                            src={logo}
                            alt="KaushalSetuAI"
                            className="h-14 w-auto rounded-full object-contain"
                        />
                        <p className="text-sm leading-relaxed text-gray-500">
                            Kaushal Setu AI bridges the gap between academic learning and 
                            real-world industry skills using intelligent AI-powered solutions.
                        </p>
                    </div>

                    {/* ---- Right Side Group ---- */}
                    <div className="flex flex-1 justify-between md:justify-around">
                        {/* Company Links */}
                        <div>
                            <p className="text-sm font-bold mb-6 text-black uppercase">Company</p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="hover:text-blue-600 cursor-pointer">Home</li>
                                <li className="hover:text-blue-600 cursor-pointer">Developer</li>
                                <li className="hover:text-blue-600 cursor-pointer">Contact Us</li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <p className="text-sm font-bold mb-6 text-black uppercase">
                                Get In Touch
                            </p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li>+91 8755671186</li>
                                <li className="text-blue-500">anmolkumar875511@gmail.com</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ---- Copyright ---- */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-sm text-center text-gray-400">
                    <p>© 2026 KaushalSetuAI. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
