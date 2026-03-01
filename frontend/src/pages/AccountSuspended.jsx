import React from 'react';
import { ShieldAlert, Mail, ArrowLeft } from 'lucide-react'; // Assuming you use lucide-react, or use icons of your choice
import { Link } from 'react-router-dom';

const AccountSuspended = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-6">
                <ShieldAlert size={64} className="text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Suspended</h1>

            <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
                Your account has been deactivated due to a violation of our community guidelines or
                terms of service. If you believe this is a mistake, please reach out to our support
                team.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/contact"
                    className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                    <Mail size={18} />
                    Contact Support
                </Link>

                <Link
                    to="/"
                    className="flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>
            </div>

            <p className="mt-12 text-sm text-gray-400">
                Reference ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
        </div>
    );
};

export default AccountSuspended;
