const mongoose = require('mongoose');
const User = require('./models/User');

require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://devansh:x0k4VgIbtSF28WSM@cluster0.mllax82.mongodb.net/WatchMe')
    .then(async () => {
        try {
            const res = await User.updateMany(
                { email: { $ne: 'admin@example.com' } },
                { $set: { role: 'user' } }
            );
            console.log('Demoted to user:', res.modifiedCount);
        } catch (err) {
            console.error(err);
        } finally {
            process.exit(0);
        }
    });
