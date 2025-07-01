const axios = require('axios');

const backendUrl = 'http://localhost:4000';

async function testDoctorDashboard() {
    try {
        console.log('🧪 Testing Doctor Dashboard...\n');

        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        const adminLogin = await axios.post(`${backendUrl}/api/admin/login`, {
            email: 'admin@vdoct.com',
            password: 'admin123'
        });

        if (!adminLogin.data.success) {
            console.log('❌ Admin login failed:', adminLogin.data.message);
            return;
        }

        const adminToken = adminLogin.data.token;
        console.log('✅ Admin login successful\n');

        // Step 2: Check if test doctor exists, if not create one
        console.log('2. Checking for test doctor...');
        const doctorsResponse = await axios.get(`${backendUrl}/api/admin/doctors`, {
            headers: { atoken: adminToken }
        });

        let testDoctor = doctorsResponse.data.doctors.find(d => d.email === 'doctor.test@vdoct.com');
        
        if (!testDoctor) {
            console.log('Test doctor not found, creating one...');
            // Create a simple test doctor without image
            const createDoctorResponse = await axios.post(`${backendUrl}/api/admin/add-doctor`, {
                name: 'Dr. John Smith',
                email: 'doctor.test@vdoct.com',
                password: 'doctor123',
                experience: '5 Year',
                fees: '500',
                about: 'Experienced cardiologist with 5 years of practice',
                speciality: 'Cardiologist',
                degree: 'MBBS, MD Cardiology',
                address: JSON.stringify({ 
                    line1: '123 Medical Center Dr', 
                    line2: 'Suite 100, City, State 12345' 
                })
            }, {
                headers: { atoken: adminToken }
            });

            if (createDoctorResponse.data.success) {
                console.log('✅ Test doctor created successfully');
                // Get the doctor again to get the ID
                const doctorsResponse2 = await axios.get(`${backendUrl}/api/admin/doctors`, {
                    headers: { atoken: adminToken }
                });
                testDoctor = doctorsResponse2.data.doctors.find(d => d.email === 'doctor.test@vdoct.com');
            } else {
                console.log('❌ Failed to create test doctor:', createDoctorResponse.data.message);
                return;
            }
        } else {
            console.log('✅ Test doctor found');
        }

        // Step 3: Verify the doctor
        console.log('\n3. Verifying the test doctor...');
        const verifyResponse = await axios.post(`${backendUrl}/api/admin/verify-doctor`, {
            doctorId: testDoctor._id,
            status: 'approved',
            notes: 'Test verification for dashboard testing',
            licenseNumber: 'LIC123456',
            registrationNumber: 'REG789012'
        }, {
            headers: { atoken: adminToken }
        });

        if (verifyResponse.data.success) {
            console.log('✅ Test doctor verified successfully');
        } else {
            console.log('❌ Failed to verify test doctor:', verifyResponse.data.message);
        }

        // Step 4: Test doctor login
        console.log('\n4. Testing doctor login...');
        const doctorLogin = await axios.post(`${backendUrl}/api/doctor/login`, {
            email: 'doctor.test@vdoct.com',
            password: 'doctor123'
        });

        if (doctorLogin.data.success) {
            console.log('✅ Doctor login successful!');
            const doctorToken = doctorLogin.data.token;

            // Step 5: Test doctor dashboard
            console.log('\n5. Testing doctor dashboard...');
            const dashboardResponse = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
                headers: { dtoken: doctorToken }
            });

            if (dashboardResponse.data.success) {
                console.log('✅ Doctor dashboard access successful');
                console.log('Dashboard data:', {
                    earnings: dashboardResponse.data.dashData.earnings,
                    appointments: dashboardResponse.data.dashData.appointments,
                    patients: dashboardResponse.data.dashData.patients,
                    latestAppointmentsCount: dashboardResponse.data.dashData.latestAppointments?.length || 0
                });
            } else {
                console.log('❌ Doctor dashboard access failed:', dashboardResponse.data.message);
            }

            // Step 6: Test doctor profile
            console.log('\n6. Testing doctor profile...');
            const profileResponse = await axios.get(`${backendUrl}/api/doctor/profile`, {
                headers: { dtoken: doctorToken }
            });

            if (profileResponse.data.success) {
                console.log('✅ Doctor profile access successful');
                console.log('Profile data:', {
                    name: profileResponse.data.profileData.name,
                    email: profileResponse.data.profileData.email,
                    speciality: profileResponse.data.profileData.speciality,
                    verificationStatus: profileResponse.data.profileData.verificationStatus
                });
            } else {
                console.log('❌ Doctor profile access failed:', profileResponse.data.message);
            }

        } else {
            console.log('❌ Doctor login failed:', doctorLogin.data.message);
        }

        console.log('\n🎉 Doctor dashboard test completed!');

    } catch (error) {
        console.log('❌ Error during testing:', error.message);
        if (error.response) {
            console.log('Response data:', error.response.data);
        }
    }
}

testDoctorDashboard(); 