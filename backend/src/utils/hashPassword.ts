// hashPassword.ts

import bcrypt from 'bcrypt';

const saltRounds = 10;
const password = 'counter2';

const hashPassword = async (password: string): Promise<string> => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error('Password hashing failed: ' + error.message);
        } else {
            throw new Error('Password hashing failed');
        }
    }
};

const runHashing = async () => {
    try {
        const hashedPassword = await hashPassword(password);
        console.log('Hashed Password:', hashedPassword);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('An unknown error occurred.');
        }
    }
};

runHashing();
