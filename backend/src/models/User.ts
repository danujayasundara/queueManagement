import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { Counter } from './Counter';
import { Issue } from './Issue';
import { Notification } from './Notification';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userName!: string;
    @Column()
    password!: string;
    @Column()
    userType!: string;

    @OneToOne(() => Counter, counter => counter.user)
    counter!: Counter;

    @OneToMany(() => Issue, issue => issue.user)
    issues!: Issue[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications!: Notification[];

}