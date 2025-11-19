import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Province } from "./Province";
import { BasicInfo } from "./Employee/BasicInfo";

@Entity()
export class Employee {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	provinceId!: number;

	@ManyToOne(() => Province, (province) => province.employees)
	@JoinColumn({ name: "provinceId" })
	province!: Province;

	@OneToOne(() => BasicInfo, (basicInfo) => basicInfo.employee, { cascade: true })
	basicInfo!: BasicInfo;

	@Column()
	workPlace!: string;

	@Column()
	performance!: string;

	@Column()
	additionalSpecifications!: string;
}
