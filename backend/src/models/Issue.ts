import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Counter } from './Counter';
import { Notification } from './Notification';

@Entity()
export class Issue {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    issueDescription!: string;
    @Column()
    name!: string;
    @Column()
    telephoneNo!: string;
    @Column()
    email!: string;
    @Column()
    status!: boolean;
    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User, user => user.issues)
    @JoinColumn({ name: 'userId'})
    user!: User;

    @Column()
    userId!: number;

    @ManyToOne(() => Counter, counter => counter.issues)
    @JoinColumn({ name: 'counterId' })
    counter!: Counter;

    @Column()
    counterId!: number;

    @OneToMany(() => Notification, notification => notification.issue)
    notifications!: Notification[];

}