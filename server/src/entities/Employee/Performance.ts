import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "../Employee";

@Entity()
export class Performance {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Employee, (employee) => employee.performance)
  employee!: Employee;

  @Column()
  dailyPerformance!: number;

  @Column()
  shiftCountPerLocation!: number;

  @Column({ type: "int" })
  shiftDuration!: number; // 8, 16, 24  

  @Column({ default: 0 })
  overtime!: number;

  @Column({ default: 0 })
  dailyLeave!: number;

  @Column({ default: 0 })
  sickLeave!: number;

  @Column({ default: 0 })
  absence!: number;

  @Column({ default: 0 })
  volunteerShiftCount!: number;

  @Column({ default: false })
  truckDriver!: boolean;

  @Column()
  monthYear!: string;

  @Column({ nullable: true })
  notes?: string;
}
