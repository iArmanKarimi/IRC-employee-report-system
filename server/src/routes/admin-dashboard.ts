import { Router, Request, Response, NextFunction } from "express";
import { Employee } from "../models/Employee";
import { Province } from "../models/Province";
import { auth } from "../middleware/auth";
import { USER_ROLE } from "../types/roles";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../middleware/logger";

const router = Router();

/**
 * Admin Dashboard Statistics
 * Provides comprehensive statistics about employees, provinces, and performance
 */
interface DashboardStats {
	totalEmployees: number;
	totalProvinces: number;
	activeEmployees: number;
	inactiveEmployees: number;
	onLeaveEmployees: number;
	newHiresThisMonth: number;
	employeesByStatus: {
		active: number;
		inactive: number;
		on_leave: number;
		no_performance: number;
	};
	employeesByProvince: Array<{
		_id: string;
		name: string;
		count: number;
	}>;
	absenceOverview: Array<{
		name: string;
		totalAbsenceHours: number;
		totalLeaveHours: number;
		totalOvertimeHours: number;
	}>;
	performanceMetrics: {
		averageDailyPerformance: number;
		totalOvertimeHours: number;
		totalLeaveHours: number;
		totalAbsenceHours: number;
	};
	employeeDistribution: {
		byEducation: Array<{
			degree: string;
			count: number;
		}>;
		byRank: Array<{
			rank: string;
			count: number;
		}>;
		byBranchByProvince: Array<{
			province: string;
			branches: Array<{
				branch: string;
				count: number;
			}>;
		}>;
		truckDriverCount: number;
		maleCount: number;
		femaleCount: number;
	};
	recentEmployees: Array<{
		_id: string;
		firstName: string;
		lastName: string;
		nationalID: string;
		provinceId: string;
		provinceName: string;
		rank: string;
		branch: string;
		status: string;
		dailyPerformance: number;
		createdAt: Date;
	}>;
}

/**
 * GET /admin-dashboard/stats
 * Fetch comprehensive admin dashboard statistics
 * Requires: Global Admin role
 */
router.get(
	"/stats",
	auth(USER_ROLE.GLOBAL_ADMIN),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Fetch all employees with province info
			const employees = await Employee.find().populate("provinceId", "name");
			const provinces = await Province.find().select("_id name");

			// Initialize stats
			const stats: DashboardStats = {
				totalEmployees: employees.length,
				totalProvinces: provinces.length,
				activeEmployees: 0,
				inactiveEmployees: 0,
				onLeaveEmployees: 0,
				newHiresThisMonth: 0,
				employeesByStatus: {
					active: 0,
					inactive: 0,
					on_leave: 0,
					no_performance: 0,
				},
				employeesByProvince: [],
				absenceOverview: [],
				performanceMetrics: {
					averageDailyPerformance: 0,
					totalOvertimeHours: 0,
					totalLeaveHours: 0,
					totalAbsenceHours: 0,
				},
				employeeDistribution: {
					byEducation: [],
					byRank: [],
				byBranchByProvince: [],
					truckDriverCount: 0,
					maleCount: 0,
					femaleCount: 0,
				},
				recentEmployees: [],
			};

			// Process employees for statistics
			const provinceMap = new Map<string, number>();
			const educationMap = new Map<string, number>();
			const rankMap = new Map<string, number>();
			const branchByProvinceMap = new Map<string, Map<string, number>>();
			let totalPerformance = 0;
			let performanceCount = 0;
			const currentMonth = new Date().getMonth();
			const currentYear = new Date().getFullYear();

			employees.forEach((emp) => {
				// Employee status
				if (emp.performance) {
					const status = emp.performance.status || "active";
					if (status === "active") {
						stats.employeesByStatus.active++;
						stats.activeEmployees++;
					} else if (status === "inactive") {
						stats.employeesByStatus.inactive++;
						stats.inactiveEmployees++;
					} else if (status === "on_leave") {
						stats.employeesByStatus.on_leave++;
						stats.onLeaveEmployees++;
					}
				} else {
					stats.employeesByStatus.no_performance++;
				}

				// New hires this month
				const empDate = new Date(emp.createdAt);
				if (empDate.getMonth() === currentMonth && empDate.getFullYear() === currentYear) {
					stats.newHiresThisMonth++;
				}

				// Province distribution
				const provinceId = (emp.provinceId as any)?._id?.toString() || emp.provinceId.toString();
				provinceMap.set(provinceId, (provinceMap.get(provinceId) || 0) + 1);

				// Education distribution
				const education = emp.additionalSpecifications?.educationalDegree || "Unknown";
				educationMap.set(education, (educationMap.get(education) || 0) + 1);

				// Rank distribution
				const rank = emp.workPlace?.rank || "Unknown";
				rankMap.set(rank, (rankMap.get(rank) || 0) + 1);

				// Branch distribution by province
				const branch = emp.workPlace?.branch || "Unknown";
				const provinceName = (emp.provinceId as any)?.name || "Unknown";
				if (!branchByProvinceMap.has(provinceId)) {
					branchByProvinceMap.set(provinceId, new Map());
				}
				const branchMapForProvince = branchByProvinceMap.get(provinceId)!;
				branchMapForProvince.set(branch, (branchMapForProvince.get(branch) || 0) + 1);

				// Performance metrics
				if (emp.performance) {
					totalPerformance += emp.performance.dailyPerformance || 0;
					performanceCount++;
					stats.performanceMetrics.totalOvertimeHours += emp.performance.overtime || 0;
					stats.performanceMetrics.totalLeaveHours += emp.performance.dailyLeave || 0;
					stats.performanceMetrics.totalAbsenceHours += emp.performance.absence || 0;
				}

				// Gender distribution
				if (emp.basicInfo?.male) {
					stats.employeeDistribution.maleCount++;
				} else {
					stats.employeeDistribution.femaleCount++;
				}

				// Truck driver count
				if (emp.additionalSpecifications?.truckDriver) {
					stats.employeeDistribution.truckDriverCount++;
				}
			});

			// Convert maps to arrays
			stats.employeesByProvince = Array.from(provinceMap.entries()).map(([provinceId, count]) => {
				const province = provinces.find((p) => p._id.toString() === provinceId);
				return {
					_id: provinceId,
					name: province?.name || "Unknown",
					count,
				};
			});

			stats.employeeDistribution.byEducation = Array.from(educationMap.entries())
				.map(([degree, count]) => ({ degree, count }))
				.sort((a, b) => b.count - a.count);

			stats.employeeDistribution.byRank = Array.from(rankMap.entries())
				.map(([rank, count]) => ({ rank, count }))
				.sort((a, b) => b.count - a.count);

			// Convert branch by province map to array sorted by province
			stats.employeeDistribution.byBranchByProvince = Array.from(branchByProvinceMap.entries())
				.map(([provinceId, branchMap]) => {
					const province = provinces.find((p) => p._id.toString() === provinceId);
					return {
						province: province?.name || "Unknown",
						branches: Array.from(branchMap.entries())
							.map(([branch, count]) => ({ branch, count }))
							.sort((a, b) => b.count - a.count),
					};
				})
				.sort((a, b) => b.branches.reduce((sum, b) => sum + b.count, 0) - a.branches.reduce((sum, b) => sum + b.count, 0));

			// Calculate average performance
			if (performanceCount > 0) {
				stats.performanceMetrics.averageDailyPerformance = Math.round((totalPerformance / performanceCount) * 100) / 100;
			}

			// Get recent employees
			const recentEmps = employees
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 20);

			stats.recentEmployees = recentEmps.map((emp) => ({
				_id: emp._id.toString(),
				firstName: emp.basicInfo?.firstName || "",
				lastName: emp.basicInfo?.lastName || "",
				nationalID: emp.basicInfo?.nationalID || "",
				provinceId: (emp.provinceId as any)?._id?.toString() || emp.provinceId.toString(),
				provinceName: (emp.provinceId as any)?.name || "Unknown",
				rank: emp.workPlace?.rank || "Unknown",
				branch: emp.workPlace?.branch || "Unknown",
				status: emp.performance?.status || "no_data",
				dailyPerformance: emp.performance?.dailyPerformance || 0,
				createdAt: emp.createdAt,
			}));

			// Build absence overview by branch
			const branchAbsenceMap = new Map<
				string,
				{ absence: number; leave: number; overtime: number }
			>();
			employees.forEach((emp) => {
				const branch = emp.workPlace?.branch || "Unknown";
				const current = branchAbsenceMap.get(branch) || { absence: 0, leave: 0, overtime: 0 };
				current.absence += emp.performance?.absence || 0;
				current.leave += emp.performance?.dailyLeave || 0;
				current.overtime += emp.performance?.overtime || 0;
				branchAbsenceMap.set(branch, current);
			});

			stats.absenceOverview = Array.from(branchAbsenceMap.entries())
				.map(([branch, data]) => ({
					name: branch,
					totalAbsenceHours: data.absence,
					totalLeaveHours: data.leave,
					totalOvertimeHours: data.overtime,
				}))
				.sort((a, b) => b.totalAbsenceHours - a.totalAbsenceHours);

			sendSuccess(res, stats);
		} catch (err) {
			logger.error("Error fetching admin dashboard stats:", err);
			sendError(res, "Failed to fetch dashboard statistics", 500);
		}
	}
);

export default router;
