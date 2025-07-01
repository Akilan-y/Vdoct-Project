import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const backendUrl = "http://localhost:4000"

    const [doctors, setDoctors] = useState([])
    const [users, setUsers] = useState([])
    const [appointments, setAppointments] = useState([])
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') ? localStorage.getItem('adminToken') : '')
    const [dashData, setDashData] = useState(null)

    // Getting Dashboard Data using API (memoized)
    const getDashData = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { atoken: adminToken } })
            if (data.success) {
                setDashData(data.dashData)
            }
            return data;
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            throw error;
        }
    }, [backendUrl, adminToken]);

    // Getting Doctors using API (memoized)
    const getDoctorsData = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/doctors', { headers: { atoken: adminToken } })
            if (data.success) {
                setDoctors(data.doctors)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, adminToken])

    // Getting Users using API (memoized)
    const getUsersData = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/users', { headers: { atoken: adminToken } })
            if (data.success) {
                setUsers(data.users)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, adminToken])

    // Getting Appointments using API (memoized)
    const getAppointmentsData = useCallback(async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/appointments', {}, { headers: { atoken: adminToken } })
            if (data.success) {
                setAppointments(data.appointments)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, adminToken])

    // Function to cancel appointment using API (memoized)
    const cancelAppointment = useCallback(async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { atoken: adminToken } })
            if (data.success) {
                toast.success(data.message)
                getDashData()
                getAppointmentsData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, adminToken, getDashData, getAppointmentsData])

    // Function to change doctor availability using API (memoized)
    const changeAvailability = useCallback(async (doctorId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { doctorId }, { headers: { atoken: adminToken } })
            if (data.success) {
                toast.success(data.message)
                getDoctorsData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, adminToken, getDoctorsData])

    // Function to refresh all data after adding a doctor (memoized)
    const refreshAllData = useCallback(async () => {
        await Promise.all([
            getDashData(),
            getDoctorsData(),
            getUsersData(),
            getAppointmentsData()
        ])
    }, [getDashData, getDoctorsData, getUsersData, getAppointmentsData])

    useEffect(() => {
        if (adminToken) {
            getDashData()
            getDoctorsData()
            getUsersData()
            getAppointmentsData()
        }
    }, [adminToken])

    const value = {
        doctors, getDoctorsData,
        users, getUsersData,
        appointments, getAppointmentsData,
        dashData, getDashData,
        cancelAppointment,
        changeAvailability,
        refreshAllData,
        backendUrl,
        adminToken, setAdminToken
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider