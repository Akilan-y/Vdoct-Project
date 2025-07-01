import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const backendUrl = "http://localhost:4000"

    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') ? localStorage.getItem('adminToken') : '')

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

    // Function to calculate age from date of birth
    const calculateAge = (dob) => {
        if (!dob || dob === 'Not Selected') return 'N/A'
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const currency = "₹"

    const value = {
        backendUrl,
        adminToken, setAdminToken,
        slotDateFormat,
        calculateAge,
        currency
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider