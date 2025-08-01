import { createContext, useEffect, useState, useCallback } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'


export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
    const navigate = useNavigate();
    const backendUrl = "http://localhost:4000"

    const [appointments, setAppointments] = useState([])
    const [doctorToken, setDoctorToken] = useState(localStorage.getItem('doctorToken') ? localStorage.getItem('doctorToken') : '')
    const [dashData, setDashData] = useState(null)
    const [profileData, setProfileData] = useState(null)

    // Debug token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('doctorToken');
        console.log('DoctorContext: Stored token exists:', !!storedToken);
        console.log('DoctorContext: Stored token length:', storedToken ? storedToken.length : 0);
        console.log('DoctorContext: Stored token preview:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');
        console.log('DoctorContext: State token exists:', !!doctorToken);
        console.log('DoctorContext: State token length:', doctorToken ? doctorToken.length : 0);
        
        // Validate token if it exists
        if (storedToken) {
            validateToken(storedToken);
        }
    }, [doctorToken]);

    // Function to validate token
    const validateToken = async (token) => {
        try {
            console.log('Validating doctor token...');
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { 
                headers: { dtoken: token } 
            });
            console.log('Token validation successful:', data.success);
        } catch (error) {
            console.log('Token validation failed:', error.response?.data?.message || error.message);
            if (error.response?.data?.message === 'Not Authorized Login Again' || 
                error.response?.data?.message === 'Token expired' ||
                error.response?.data?.message === 'Invalid token format') {
                console.log('Removing invalid token...');
                setDoctorToken('');
                localStorage.removeItem('doctorToken');
                toast.error('Session expired. Please login again.');
                navigate('/');
            }
        }
    };

    // Axios interceptor for handling unauthorized errors globally
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => {
                // If response is successful, just return it
                return response;
            },
            (error) => {
                // If error response contains the not authorized message, handle logout
                if (
                    error.response &&
                    error.response.data &&
                    (error.response.data.message === 'Not Authorized Login Again' || error.response.data.message === 'jwt expired')
                ) {
                    toast.error('Session expired. Please login again.');
                    setDoctorToken('');
                    localStorage.removeItem('doctorToken');
                    navigate('/');
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, [navigate]);

    // Sync doctorToken state with localStorage changes (multi-tab support)
    useEffect(() => {
        const syncToken = () => {
            const token = localStorage.getItem('doctorToken') || '';
            setDoctorToken(token);
        };
        window.addEventListener('storage', syncToken);
        return () => window.removeEventListener('storage', syncToken);
    }, []);

    // Getting Appointments using API
    const getAppointmentsData = useCallback(async () => {
        try {
            console.log('Sending doctorToken for appointments:', doctorToken);
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dtoken: doctorToken } })
            if (data.success) {
                setAppointments(data.appointments)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [doctorToken, backendUrl])

    useEffect(() => {
        if (doctorToken) {
            getAppointmentsData()
        }
    }, [doctorToken, getAppointmentsData])

    // Getting Doctor profile data from Database using API
    const getProfileData = useCallback(async () => {
        try {
            console.log('Sending doctorToken for profile:', doctorToken);
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dtoken: doctorToken } })
            console.log(data.profileData)
            setProfileData(data.profileData)

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [doctorToken, backendUrl])

    // Function to cancel doctor appointment using API
    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dtoken: doctorToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointmentsData()
                // after creating dashboard
                getDashData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Function to Mark appointment completed using API
    const completeAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dtoken: doctorToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointmentsData()
                // Later after creating getDashData Function
                getDashData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Getting Doctor dashboard data using API
    const getDashData = useCallback(async () => {
        try {
            console.log('Sending doctorToken for dashboard:', doctorToken);
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dtoken: doctorToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }, [doctorToken, backendUrl])

    // Load profile and dashboard data when token changes
    useEffect(() => {
        if (doctorToken) {
            getProfileData()
            getDashData()
        }
    }, [doctorToken, getProfileData, getDashData])

    const value = {
        appointments, getAppointmentsData,
        backendUrl,
        doctorToken, setDoctorToken,
        cancelAppointment,
        completeAppointment,
        dashData, getDashData,
        profileData, setProfileData,
        getProfileData,
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )

}

export default DoctorContextProvider