import { toast } from 'react-toastify';

export const handleSuccess = (msg) => {
    toast.success(msg, {
        position: 'top-right'
    })
}

export const handleError = (msg) => {
    toast.error(msg, {
        position: 'top-right'
    })
}

// In Vite, we use import.meta.env instead of process.env
// The prefix must be VITE_ for it to be accessible on the client
export const APIUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
