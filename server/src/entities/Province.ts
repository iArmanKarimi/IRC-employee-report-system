import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Employee } from "./Employee";

@Entity()
export class Province {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	name!: string;

	@OneToOne(() => User, (user) => user.provinceAdmin)
	admin!: User;

	@OneToMany(() => Employee, (employee) => employee.province)
	employees!: Employee[];
}
