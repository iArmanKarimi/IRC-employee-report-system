// User role types and constants
export const USER_ROLE = {
	GLOBAL_ADMIN: "globalAdmin",
	PROVINCE_ADMIN: "provinceAdmin"
} as const;
type UserRol = {
	readonly GLOBAL_ADMIN: "globalAdmin",
}
export type UserRoleType = typeof USER_ROLE[keyof typeof USER_ROLE];
