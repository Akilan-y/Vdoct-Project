const axios = require('axios');
const FormData = require('form-data');

const backendUrl = 'http://localhost:4000';

async function testDatabaseConnectivity() {
    console.log('Testing Database Connectivity...\n');

    try {
        // 1. Test admin login
        console.log('1. Testing Admin Login...');
        const adminLoginResponse = await axios.post(`${backendUrl}/api/admin/login`, {
            email: 'admin@vdoct.com',
            password: 'admin123'
        });
        
        if (adminLoginResponse.data.success) {
            console.log('✅ Admin login successful');
            const adminToken = adminLoginResponse.data.token;
            
            // 2. Test adding a doctor
            console.log('\n2. Testing Doctor Addition...');
            
            // Create FormData for multipart/form-data request
            const formData = new FormData();
            formData.append('name', 'Dr. Test Doctor');
            formData.append('email', 'testdoctor@example.com');
            formData.append('password', 'testpass123');
            formData.append('speciality', 'General physician');
            formData.append('degree', 'MBBS');
            formData.append('experience', '5 Years');
            formData.append('about', 'A test doctor for database connectivity testing');
            formData.append('fees', '100');
            formData.append('address', JSON.stringify({ line1: 'Test Address 1', line2: 'Test Address 2' }));
            // No image file - should use default avatar
            
            const addDoctorResponse = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
                headers: { 
                    atoken: adminToken,
                    ...formData.getHeaders()
                }
            });
            
            if (addDoctorResponse.data.success) {
                console.log('✅ Doctor added successfully');
                
                // 3. Test doctor login
                console.log('\n3. Testing Doctor Login...');
                const doctorLoginResponse = await axios.post(`${backendUrl}/api/doctor/login`, {
                    email: 'testdoctor@example.com',
                    password: 'testpass123'
                });
                
                if (doctorLoginResponse.data.success) {
                    console.log('✅ Doctor login successful');
                    const doctorToken = doctorLoginResponse.data.token;
                    
                    // 4. Test getting doctor profile
                    console.log('\n4. Testing Doctor Profile...');
                    const profileResponse = await axios.get(`${backendUrl}/api/doctor/profile`, {
                        headers: { dToken: doctorToken }
                    });
                    
                    if (profileResponse.data.success) {
                        console.log('✅ Doctor profile retrieved successfully');
                        console.log('   Doctor Name:', profileResponse.data.profileData.name);
                        console.log('   Speciality:', profileResponse.data.profileData.speciality);
                    } else {
                        console.log('❌ Failed to get doctor profile');
                    }
                } else {
                    console.log('❌ Doctor login failed:', doctorLoginResponse.data.message);
                }
                
                // 5. Test getting doctors list for frontend
                console.log('\n5. Testing Frontend Doctors List...');
                const doctorsListResponse = await axios.get(`${backendUrl}/api/doctor/list`);
                
                if (doctorsListResponse.data.success) {
                    console.log('✅ Frontend doctors list retrieved successfully');
                    console.log('   Number of available doctors:', doctorsListResponse.data.doctors.length);
                    
                    // Check if our test doctor is in the list (by name instead of email)
                    const testDoctor = doctorsListResponse.data.doctors.find(doc => doc.name === 'Dr. Test Doctor');
                    if (testDoctor) {
                        console.log('✅ Test doctor found in frontend list');
                        console.log('   Doctor details:', { name: testDoctor.name, speciality: testDoctor.speciality, available: testDoctor.available });
                    } else {
                        console.log('❌ Test doctor not found in frontend list');
                    }
                } else {
                    console.log('❌ Failed to get frontend doctors list');
                }
                
                // 6. Test getting all doctors for admin panel
                console.log('\n6. Testing Admin Doctors List...');
                const adminDoctorsResponse = await axios.get(`${backendUrl}/api/admin/doctors`, {
                    headers: { atoken: adminToken }
                });
                
                if (adminDoctorsResponse.data.success) {
                    console.log('✅ Admin doctors list retrieved successfully');
                    console.log('   Total number of doctors:', adminDoctorsResponse.data.doctors.length);
                } else {
                    console.log('❌ Failed to get admin doctors list');
                }
                
            } else {
                console.log('❌ Failed to add doctor:', addDoctorResponse.data.message);
            }
        } else {
            console.log('❌ Admin login failed:', adminLoginResponse.data.message);
        }
        
    } catch (error) {
        console.log('❌ Error during testing:', error.message);
        if (error.response) {
            console.log('   Response data:', error.response.data);
        }
    }
    
    console.log('\nDatabase connectivity test completed!');
}

// Run the test
testDatabaseConnectivity(); 