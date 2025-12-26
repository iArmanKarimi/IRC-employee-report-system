// User role types and constants
export const USER_ROLE = {
	GLOBAL_ADMIN: "globalAdmin",
	PROVINCE_ADMIN: "provinceAdmin"
} as const;

export type UserRoleType = typeof USER_ROLE[keyof typeof USER_ROLE];

// Basic Info sub-schema
export interface IBasicInfo {
	firstName: string;
	lastName: string;
	nationalID: string;
	male: boolean;
	married: boolean;
	childrenCount: number;
}

// WorkPlace sub-schema
export interface IWorkPlace {
	branch: string;
	rank: string;
	licensedWorkplace: string;
}

// Additional Specifications sub-schema
export interface IAdditionalSpecifications {
	educationalDegree: string;
	dateOfBirth: Date | string;
	contactNumber: string;
	jobStartDate: Date | string;
	jobEndDate?: Date | string;
	truckDriver: boolean;
}

// Performance sub-schema
export interface IPerformance {
	dailyPerformance: number;
	shiftCountPerLocation: number;
	shiftDuration: 8 | 16 | 24;
	overtime: number;
	dailyLeave: number;
	sickLeave: number;
	absence: number;
	travelAssignment: number;
	status: 'active' | 'inactive' | 'on_leave';
	notes?: string;
}

// Employee model
export interface IEmployee {
	_id: string;
	provinceId: string | IProvince;
	basicInfo: IBasicInfo;
	workPlace: IWorkPlace;
	additionalSpecifications: IAdditionalSpecifications;
	performance?: IPerformance;
	createdAt: Date | string;
	updatedAt: Date | string;
}

// Province model
export interface IProvince {
	_id: string;
	name: string;
	admin: string | IUser;
	employees: string[];
	imageUrl?: string;
}

// User model
export interface IUser {
	_id: string;
	username: string;
	role: UserRoleType;
	provinceId?: string | IProvince;
}

// Form types for creating/updating
export type CreateEmployeeInput = Omit<IEmployee, '_id' | 'createdAt' | 'updatedAt' | 'performance'> & { performance?: IPerformance };
export type UpdateEmployeeInput = Partial<Omit<IEmployee, '_id' | 'provinceId' | 'createdAt' | 'updatedAt'>>;
