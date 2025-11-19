import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from "typeorm";
import { Province } from "./Province";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: "text" })
  role!: "globalAdmin" | "provinceAdmin";

  @OneToOne(() => Province, (province) => province.admin, { nullable: true })
  provinceAdmin?: Province;
}
