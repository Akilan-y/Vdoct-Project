const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const backendUrl = 'http://localhost:4000';

async function testDoctorLogin() {
    try {
        console.log('🧪 Testing Doctor Login System...\n');

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

        // Step 2: Add a test doctor
        console.log('2. Adding a test doctor...');
        
        // Create a simple test image (or use existing one)
        const testImagePath = path.join(__dirname, 'test_doctor_image.png');
        
        // Create a simple PNG file if it doesn't exist
        if (!fs.existsSync(testImagePath)) {
            // Create a minimal PNG file (1x1 pixel, transparent)
            const pngBuffer = Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
                0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
                0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
                0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
                0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
            ]);
            fs.writeFileSync(testImagePath, pngBuffer);
        }

        const formData = new FormData();
        formData.append('image', fs.createReadStream(testImagePath));
        formData.append('name', 'Dr. John Smith');
        formData.append('email', 'doctor.test@vdoct.com');
        formData.append('password', 'doctor123');
        formData.append('experience', '5 Year');
        formData.append('fees', '500');
        formData.append('about', 'Experienced cardiologist with 5 years of practice');
        formData.append('speciality', 'Cardiologist');
        formData.append('degree', 'MBBS, MD Cardiology');
        formData.append('address', JSON.stringify({ 
            line1: '123 Medical Center Dr', 
            line2: 'Suite 100, City, State 12345' 
        }));

        const addDoctorResponse = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
            headers: {
                ...formData.getHeaders(),
                atoken: adminToken
            }
        });

        if (addDoctorResponse.data.success) {
            console.log('✅ Test doctor added successfully');
        } else {
            console.log('❌ Failed to add test doctor:', addDoctorResponse.data.message);
            return;
        }

        // Step 3: Verify the doctor (approve verification)
        console.log('\n3. Verifying the test doctor...');
        
        // First get the doctor ID
        const doctorsResponse = await axios.get(`${backendUrl}/api/admin/doctors`, {
            headers: { atoken: adminToken }
        });

        const testDoctor = doctorsResponse.data.doctors.find(d => d.email === 'doctor.test@vdoct.com');
        
        if (!testDoctor) {
            console.log('❌ Test doctor not found in admin list');
            return;
        }

        const verifyResponse = await axios.post(`${backendUrl}/api/admin/verify-doctor`, {
            doctorId: testDoctor._id,
            status: 'approved',
            notes: 'Test verification for login testing',
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
            console.log('Token received:', doctorLogin.data.token.substring(0, 20) + '...');
            
            const doctorToken = doctorLogin.data.token;

            // Step 5: Test doctor profile access
            console.log('\n5. Testing doctor profile access...');
            const profileResponse = await axios.get(`${backendUrl}/api/doctor/profile`, {
                headers: { dtoken: doctorToken }
            });

            if (profileResponse.data.success) {
                console.log('✅ Doctor profile access successful');
                console.log('Doctor name:', profileResponse.data.profileData.name);
                console.log('Speciality:', profileResponse.data.profileData.speciality);
                console.log('Verification status:', profileResponse.data.profileData.verificationStatus);
            } else {
                console.log('❌ Doctor profile access failed:', profileResponse.data.message);
            }

            // Step 6: Test doctor dashboard access
            console.log('\n6. Testing doctor dashboard access...');
            const dashboardResponse = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
                headers: { dtoken: doctorToken }
            });

            if (dashboardResponse.data.success) {
                console.log('✅ Doctor dashboard access successful');
                console.log('Dashboard data:', {
                    earnings: dashboardResponse.data.dashData.earnings,
                    appointments: dashboardResponse.data.dashData.appointments,
                    patients: dashboardResponse.data.dashData.patients
                });
            } else {
                console.log('❌ Doctor dashboard access failed:', dashboardResponse.data.message);
            }

        } else {
            console.log('❌ Doctor login failed:', doctorLogin.data.message);
        }

        // Step 7: Test frontend doctor list (should show verified doctor)
        console.log('\n7. Testing frontend doctor list...');
        const frontendDoctorsResponse = await axios.get(`${backendUrl}/api/doctor/list`);
        
        if (frontendDoctorsResponse.data.success) {
            const testDoctorInFrontend = frontendDoctorsResponse.data.doctors.find(
                d => d.email === 'doctor.test@vdoct.com'
            );
            
            if (testDoctorInFrontend) {
                console.log('✅ Test doctor appears in frontend list');
                console.log('Frontend doctor data:', {
                    name: testDoctorInFrontend.name,
                    available: testDoctorInFrontend.available,
                    isVerified: testDoctorInFrontend.isVerified
                });
            } else {
                console.log('❌ Test doctor not found in frontend list');
            }
        } else {
            console.log('❌ Frontend doctor list failed:', frontendDoctorsResponse.data.message);
        }

        console.log('\n🎉 Doctor login system test completed!');

    } catch (error) {
        console.log('❌ Error during testing:', error.message);
        if (error.response) {
            console.log('Response data:', error.response.data);
        }
    }
}

testDoctorLogin(); 