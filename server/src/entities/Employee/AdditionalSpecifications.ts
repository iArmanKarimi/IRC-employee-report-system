import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "../Employee";

@Entity()
export class AdditionalSpecifications {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Employee, (employee) => employee.additionalSpecifications)
  employee!: Employee;

  @Column()
  educationalDegree!: string;

  @Column({ type: "date" })
  dateOfBirth!: Date;

  @Column()
  contactNumber!: string;

  @Column({ type: "date" })
  jobStartDate!: Date;

  @Column({ type: "date", nullable: true })
  jobEndDate?: Date;

  @Column({ default: "active" })
  status!: string;
}
