import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../modules/users/user.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  bed: string;

  @Column()
  room: string;

  @Column()
  condition: string;

  @Column('int')
  age: number;

  @Column()
  gender: string;

  @Column()
  admitted: string;

  @ManyToOne(() => User, (user) => user.patients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
