import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { doctors as sampleDoctors } from '../assets/assets';

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    // Hardcode the backend URL instead of using environment variable
    const backendUrl = "http://localhost:4000"

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        if (!slotDate || typeof slotDate !== 'string') {
            return 'Invalid Date';
        }
        try {
            const dateArray = slotDate.split('_')
            if (dateArray.length !== 3) {
                return 'Invalid Date Format';
            }
            return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }

    // Getting Doctors using API
    const getDoctosData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success && data.doctors && data.doctors.length > 0) {
                setDoctors(data.doctors)
                console.log('Fetched doctors from database:', data.doctors.length)
            } else {
                console.log('No doctors in database, using sample data')
                setDoctors(sampleDoctors)
            }
        } catch (error) {
            console.log('Error fetching doctors:', error.message)
            console.log('Using sample doctors as fallback')
            setDoctors(sampleDoctors)
        }
    }

    // Function to refresh doctors list
    const refreshDoctors = async () => {
        await getDoctosData()
    }

    // Getting User Profile using API
    const loadUserProfileData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })

            if (data.success) {
                setUserData(data.userData)
            } else {
                setUserData(null)
                toast.error(data.message)
            }

        } catch (error) {
            setUserData(null)
            console.log(error)
            toast.error(error.message)
        }

    }

    useEffect(() => {
        getDoctosData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    const value = {
        doctors, getDoctosData,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData,
        refreshDoctors,
        slotDateFormat
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider