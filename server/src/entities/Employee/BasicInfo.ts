import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "../Employee";

@Entity()
export class BasicInfo {
	@PrimaryGeneratedColumn()
	id!: number;

	@OneToOne(() => Employee, (employee) => employee.basicInfo)
	employee!: Employee;

	@Column()
	firstName!: string;

	@Column()
	lastName!: string;

	@Column({ unique: true })
	nationalID!: string;

	@Column()
	male!: boolean;

	@Column({ default: false })
	married!: boolean;

	@Column({ default: 0 })
	childrenCount!: number;
}
