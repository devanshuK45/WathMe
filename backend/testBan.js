const axios = require('axios');
require('dotenv').config({ path: './.env' });

const testBan = async () => {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;

        console.log('Logged in, got token');

        // Fetch users to get a valid user ID
        const usersRes = await axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const normalUser = usersRes.data.find(u => u.role !== 'admin');
        if (!normalUser) {
            console.log('No normal users found to test ban on');
            return;
        }

        console.log(`Attempting to ban user: ${normalUser.email} (${normalUser._id})`);

        const banRes = await axios.put(`http://localhost:5000/api/users/${normalUser._id}/ban`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Ban success:', banRes.data);
    } catch (e) {
        console.error('Test failed:');
        console.error(e.response?.data || e.message);
    }
};

testBan();
