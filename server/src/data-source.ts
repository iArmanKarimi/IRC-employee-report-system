import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Province } from "./entities/Province";
import { Employee } from "./entities/Employee";
import { BasicInfo } from './entities/Employee/BasicInfo';
import { WorkPlace } from './entities/Employee/WorkPlace';
import { AdditionalSpecifications } from './entities/Employee/AdditionalSpecifications';

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  synchronize: true,
  logging: false,
  entities: [
    User,
    Province,
    Employee,
    // employee sub-entities
    BasicInfo,
    WorkPlace,
    Performance,
    AdditionalSpecifications,
  ],
});
