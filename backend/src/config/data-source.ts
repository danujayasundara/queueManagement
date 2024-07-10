import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Counter } from '../models/Counter';
import { Issue } from '../models/Issue';
import { Notification } from '../models/Notification';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource ({
    type: 'mysql',
    host: 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [User, Counter, Issue, Notification],
});

AppDataSource.initialize()
    .then(() => {
        console.log('Data source has been initialized!');
    })
    .catch((error) => {
        console.error('Error during Data Source initialization: ', error);
    });