import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "../Employee";

@Entity()
export class WorkPlace {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Employee, (employee) => employee.workPlace)
  employee!: Employee;

  @Column()
  provinceName!: string;

  @Column()
  branch!: string;

  @Column()
  rank!: string;

  @Column()
  licensedWorkplace!: string;

  @Column({ default: false })
  travelAssignment!: boolean;
}
