const axios = require('axios');

async function checkDoctors() {
    try {
        // Check frontend doctors list
        console.log('Checking frontend doctors list...');
        const frontendResponse = await axios.get('http://localhost:4000/api/doctor/list');
        console.log('Frontend doctors:', frontendResponse.data.doctors.map(d => ({
            name: d.name, 
            email: d.email, 
            available: d.available,
            hasImage: !!d.image
        })));

        // Check admin doctors list (need to login first)
        console.log('\nChecking admin doctors list...');
        const adminLogin = await axios.post('http://localhost:4000/api/admin/login', {
            email: 'admin@vdoct.com',
            password: 'admin123'
        });
        
        if (adminLogin.data.success) {
            const adminResponse = await axios.get('http://localhost:4000/api/admin/doctors', {
                headers: { atoken: adminLogin.data.token }
            });
            console.log('Admin doctors:', adminResponse.data.doctors.map(d => ({
                name: d.name, 
                email: d.email, 
                available: d.available,
                hasImage: !!d.image
            })));
        }

        // Test doctor login
        console.log('\nTesting doctor login...');
        const doctorLogin = await axios.post('http://localhost:4000/api/doctor/login', {
            email: 'testdoctor@example.com',
            password: 'testpass123'
        });
        console.log('Doctor login result:', doctorLogin.data);

    } catch (error) {
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Response data:', error.response.data);
        }
    }
}

checkDoctors(); 