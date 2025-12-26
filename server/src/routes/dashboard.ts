import { Router, Request, Response, NextFunction } from "express";
import { Employee } from "../models/Employee";
import { Province } from "../models/Province";
import { User } from "../models/User";
import { auth } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { HttpError } from "../utils/errors";
import { logger } from "../middleware/logger";

const router = Router();

/**
 * GET /dashboard/overview
 * Get high-level dashboard metrics for all provinces and employees
 * Global Admin only
 */
router.get(
	"/overview",
	auth(USER_ROLE.GLOBAL_ADMIN),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const [
				totalProvinces,
				totalEmployees,
				totalAdmins,
				activeEmployees,
				inactiveEmployees,
				onLeaveEmployees,
			] = await Promise.all([
				Province.countDocuments(),
				Employee.countDocuments(),
				User.countDocuments({ role: USER_ROLE.PROVINCE_ADMIN }),
				Employee.countDocuments({ "performance.status": "active" }),
				Employee.countDocuments({ "performance.status": "inactive" }),
				Employee.countDocuments({ "performance.status": "on_leave" }),
			]);

			const overview = {
				totalProvinces,
				totalEmployees,
				totalAdmins,
				employeeStatuses: {
					active: activeEmployees,
					inactive: inactiveEmployees,
					onLeave: onLeaveEmployees,
				},
			};

			logger.info("Dashboard overview retrieved", { overview });
			res.json({
				success: true,
				data: overview,
				message: "Dashboard overview retrieved successfully",
			});
		} catch (err: unknown) {
			next(err);
		}
	}
);

/**
 * GET /dashboard/analytics
 * Get detailed analytics for the dashboard
 * Global Admin only
 */
router.get(
	"/analytics",
	auth(USER_ROLE.GLOBAL_ADMIN),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Get aggregate data for all employees
			const [employeeStats, provinceStats, performanceStats] = await Promise.all([
				// Employee distribution
				Employee.aggregate([
					{
						$group: {
							_id: null,
							totalCount: { $sum: 1 },
							avgChildrenCount: { $avg: "$basicInfo.childrenCount" },
							maleCount: {
								$sum: { $cond: [{ $eq: ["$basicInfo.male", true] }, 1, 0] },
							},
							femaleCount: {
								$sum: { $cond: [{ $eq: ["$basicInfo.male", false] }, 1, 0] },
							},
							marriedCount: {
								$sum: { $cond: [{ $eq: ["$basicInfo.married", true] }, 1, 0] },
							},
						},
					},
				]),
				// Province distribution
				Province.aggregate([
					{
						$lookup: {
							from: "employees",
							localField: "_id",
							foreignField: "provinceId",
							as: "employees",
						},
					},
					{
						$project: {
							name: 1,
							employeeCount: { $size: "$employees" },
						},
					},
					{
						$sort: { employeeCount: -1 },
					},
					{
						$limit: 10,
					},
				]),
				// Performance statistics
				Employee.aggregate([
					{
						$group: {
							_id: "$performance.status",
							count: { $sum: 1 },
							avgDailyPerformance: {
								$avg: "$performance.dailyPerformance",
							},
							avgOvertimeHours: { $avg: "$performance.overtime" },
							totalTruckDrivers: {
								$sum: {
									$cond: [
										{ $eq: ["$performance.truckDriver", true] },
										1,
										0,
									],
								},
							},
						},
					},
					{
						$sort: { _id: 1 },
					},
				]),
			]);

			const analytics = {
				employees: employeeStats[0] || {
					totalCount: 0,
					avgChildrenCount: 0,
					maleCount: 0,
					femaleCount: 0,
					marriedCount: 0,
				},
				provinces: provinceStats,
				performance: performanceStats,
			};

			logger.info("Dashboard analytics retrieved", {
				totalEmployees: analytics.employees.totalCount,
				provinceCount: analytics.provinces.length,
			});

			res.json({
				success: true,
				data: analytics,
				message: "Dashboard analytics retrieved successfully",
			});
		} catch (err: unknown) {
			next(err);
		}
	}
);

/**
 * GET /dashboard/performance-summary
 * Get performance metrics summary for all employees
 * Global Admin only
 */
router.get(
	"/performance-summary",
	auth(USER_ROLE.GLOBAL_ADMIN),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const performanceSummary = await Employee.aggregate([
				{
					$group: {
						_id: "$performance.status",
						count: { $sum: 1 },
						avgDailyPerformance: {
							$avg: "$performance.dailyPerformance",
						},
						avgDailyLeave: { $avg: "$performance.dailyLeave" },
						avgSickLeave: { $avg: "$performance.sickLeave" },
						avgAbsence: { $avg: "$performance.absence" },
						avgOvertime: { $avg: "$performance.overtime" },
						totalShifts: {
							$sum: "$performance.shiftCountPerLocation",
						},
						avgShiftDuration: {
							$avg: "$performance.shiftDuration",
						},
					},
				},
				{
					$sort: { _id: 1 },
				},
			]);

			// Get rank distribution
			const rankDistribution = await Employee.aggregate([
				{
					$group: {
						_id: "$workPlace.rank",
						count: { $sum: 1 },
						avgDailyPerformance: {
							$avg: "$performance.dailyPerformance",
						},
					},
				},
				{
					$sort: { count: -1 },
				},
			]);

			// Get branch distribution
			const branchDistribution = await Employee.aggregate([
				{
					$group: {
						_id: "$workPlace.branch",
						count: { $sum: 1 },
						avgPerformance: {
							$avg: "$performance.dailyPerformance",
						},
					},
				},
				{
					$sort: { count: -1 },
				},
			]);

			const summary = {
				byStatus: performanceSummary,
				byRank: rankDistribution,
				byBranch: branchDistribution,
			};

			logger.info("Performance summary retrieved", {
				statusGroups: summary.byStatus.length,
				rankDistribution: summary.byRank.length,
				branchDistribution: summary.byBranch.length,
			});

			res.json({
				success: true,
				data: summary,
				message: "Performance summary retrieved successfully",
			});
		} catch (err: unknown) {
			next(err);
		}
	}
);

/**
 * GET /dashboard/provinces-overview
 * Get detailed overview of all provinces with employee counts and admins
 * Global Admin only
 */
router.get(
	"/provinces-overview",
	auth(USER_ROLE.GLOBAL_ADMIN),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const provincesOverview = await Province.aggregate([
				{
					$lookup: {
						from: "users",
						localField: "admin",
						foreignField: "_id",
						as: "adminInfo",
					},
				},
				{
					$lookup: {
						from: "employees",
						localField: "_id",
						foreignField: "provinceId",
						as: "employeesList",
					},
				},
				{
					$addFields: {
						employeeCount: { $size: "$employeesList" },
						admin: { $arrayElemAt: ["$adminInfo", 0] },
						activeEmployeeCount: {
							$size: {
								$filter: {
									input: "$employeesList",
									as: "emp",
									cond: { $eq: ["$$emp.performance.status", "active"] },
								},
							},
						},
						avgEmployeePerformance: {
							$avg: "$employeesList.performance.dailyPerformance",
						},
					},
				},
				{
					$project: {
						_id: 1,
						name: 1,
						employeeCount: 1,
						activeEmployeeCount: 1,
						avgEmployeePerformance: {
							$round: ["$avgEmployeePerformance", 2],
						},
						admin: {
							_id: 1,
							username: 1,
						},
					},
				},
				{
					$sort: { employeeCount: -1 },
				},
			]);

			logger.info("Provinces overview retrieved", {
				count: provincesOverview.length,
			});

			res.json({
				success: true,
				data: provincesOverview,
				message: "Provinces overview retrieved successfully",
			});
		} catch (err: unknown) {
			next(err);
		}
	}
);

/**
 * GET /dashboard/recent-activity
 * Get recent employee activity (recently created/updated employees)
 * Global Admin only
 */
router.get(
	"/recent-activity",
	auth(USER_ROLE.GLOBAL_ADMIN),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
			const recentActivity = await Employee.aggregate([
				{
					$lookup: {
						from: "provinces",
						localField: "provinceId",
						foreignField: "_id",
						as: "province",
					},
				},
				{
					$project: {
						_id: 1,
						basicInfo: 1,
						createdAt: 1,
						updatedAt: 1,
						province: {
							_id: { $arrayElemAt: ["$province._id", 0] },
							name: { $arrayElemAt: ["$province.name", 0] },
						},
					},
				},
				{
					$sort: { updatedAt: -1 },
				},
				{
					$limit: limit,
				},
			]);

			logger.info("Recent activity retrieved", { count: recentActivity.length });

			res.json({
				success: true,
				data: recentActivity,
				message: "Recent activity retrieved successfully",
			});
		} catch (err: unknown) {
			next(err);
		}
	}
);

export default router;
