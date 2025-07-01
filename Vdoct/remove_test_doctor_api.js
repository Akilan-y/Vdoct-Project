const axios = require('axios');

const backendUrl = 'http://localhost:4000';

async function removeTestDoctors() {
    try {
        console.log('Removing test doctors...');
        
        // 1. Login as admin
        const adminLogin = await axios.post(`${backendUrl}/api/admin/login`, {
            email: 'admin@vdoct.com',
            password: 'admin123'
        });
        
        if (!adminLogin.data.success) {
            console.log('❌ Admin login failed');
            return;
        }
        
        const adminToken = adminLogin.data.token;
        console.log('✅ Admin login successful');
        
        // 2. Get all doctors
        const doctorsResponse = await axios.get(`${backendUrl}/api/admin/doctors`, {
            headers: { atoken: adminToken }
        });
        
        if (!doctorsResponse.data.success) {
            console.log('❌ Failed to get doctors list');
            return;
        }
        
        const doctors = doctorsResponse.data.doctors;
        console.log(`Found ${doctors.length} doctors in database`);
        
        // 3. Find and remove test doctors
        let removedCount = 0;
        for (const doctor of doctors) {
            if (doctor.name === 'Dr. Test Doctor' || 
                doctor.email && doctor.email.includes('testdoctor')) {
                
                console.log(`Removing test doctor: ${doctor.name} (${doctor.email})`);
                
                // Delete the doctor using the API
                const deleteResponse = await axios.post(`${backendUrl}/api/admin/delete-doctor`, {
                    doctorId: doctor._id
                }, {
                    headers: { atoken: adminToken }
                });
                
                if (deleteResponse.data.success) {
                    console.log(`✅ Successfully removed: ${doctor.name}`);
                    removedCount++;
                } else {
                    console.log(`❌ Failed to remove: ${doctor.name} - ${deleteResponse.data.message}`);
                }
            }
        }
        
        if (removedCount === 0) {
            console.log('✅ No test doctors found to remove');
        } else {
            console.log(`✅ Successfully removed ${removedCount} test doctor(s)`);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('   Response:', error.response.data);
        }
    }
}

removeTestDoctors(); 