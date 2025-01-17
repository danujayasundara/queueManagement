import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Issue } from './Issue';

@Entity()
export class Counter {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    cName!: string;
    @Column({ default: false })
    status!: boolean;

    @OneToOne(() => User, user => user.counter)
    @JoinColumn({ name: 'cUserId'})
    user!: User;
    @Column({ nullable: true })
    cUserId!: number | null;

    @OneToMany(() => Issue, issue => issue.counter)
    issues!: Issue[];

}