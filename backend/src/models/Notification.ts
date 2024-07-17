import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Issue } from './Issue';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;
    @Column({ default: false })
    status!: boolean;
    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User, user => user.notifications)
    @JoinColumn({ name: 'notifUserId'})
    user!: User;

    @Column()
    notifUserId!: number;

    @ManyToOne(() => Issue, issue => issue.notifications)
    @JoinColumn({ name: 'issueId' })
    issue!: Issue;

    @Column()
    issueId!: number;

}