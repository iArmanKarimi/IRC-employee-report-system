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
	absenceOverviewByProvince: Array<{
		province: string;
		data: Array<{
			name: string;
			totalAbsenceHours: number;
			totalLeaveHours: number;
			totalOvertimeHours: number;
		}>;
	}>;
	performanceMetricsByProvince: Array<{
		province: string;
		data: {
			averageDailyPerformance: number;
			totalOvertimeHours: number;
			totalLeaveHours: number;
			totalAbsenceHours: number;
			employeeCount: number;
		};
	}>;
	globalPerformanceMetrics: {
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
		byRankByProvince: Array<{
			province: string;
			total: number;
			data: Array<{
				rank: string;
				count: number;
			}>;
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
				absenceOverviewByProvince: [],
				performanceMetricsByProvince: [],
				globalPerformanceMetrics: {
					averageDailyPerformance: 0,
					totalOvertimeHours: 0,
					totalLeaveHours: 0,
					totalAbsenceHours: 0,
				},
				employeeDistribution: {
					byEducation: [],
					byRankByProvince: [],
					byBranchByProvince: [],
					truckDriverCount: 0,
					maleCount: 0,
					femaleCount: 0,
				},
			};

			// Process employees for statistics
			const provinceMap = new Map<string, number>();
			const educationMap = new Map<string, number>();
			const rankByProvinceMap = new Map<string, Map<string, number>>();
			const branchByProvinceMap = new Map<string, Map<string, number>>();
			const absenceByProvinceMap = new Map<string, Map<string, { absence: number; leave: number; overtime: number }>>();
			const performanceByProvinceMap = new Map<string, { totalPerf: number; count: number; totalOT: number; totalLeave: number; totalAbsence: number }>();
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

				// Rank distribution by province
				const rank = emp.workPlace?.rank || "Unknown";
				const provinceIdStr = (emp.provinceId as any)?._id?.toString() || emp.provinceId.toString();
				if (!rankByProvinceMap.has(provinceIdStr)) {
					rankByProvinceMap.set(provinceIdStr, new Map());
				}
				const rankMapForProvince = rankByProvinceMap.get(provinceIdStr)!;
				rankMapForProvince.set(rank, (rankMapForProvince.get(rank) || 0) + 1);

				// Branch distribution by province
				const branch = emp.workPlace?.branch || "Unknown";
				const provinceName = (emp.provinceId as any)?.name || "Unknown";
				if (!branchByProvinceMap.has(provinceId)) {
					branchByProvinceMap.set(provinceId, new Map());
				}
				const branchMapForProvince = branchByProvinceMap.get(provinceId)!;
				branchMapForProvince.set(branch, (branchMapForProvince.get(branch) || 0) + 1);

				// Performance metrics by province
				if (emp.performance) {
					totalPerformance += emp.performance.dailyPerformance || 0;
					performanceCount++;
					stats.globalPerformanceMetrics.totalOvertimeHours += emp.performance.overtime || 0;
					stats.globalPerformanceMetrics.totalLeaveHours += emp.performance.dailyLeave || 0;
					stats.globalPerformanceMetrics.totalAbsenceHours += emp.performance.absence || 0;

					// Track per province
					if (!performanceByProvinceMap.has(provinceIdStr)) {
						performanceByProvinceMap.set(provinceIdStr, {
							totalPerf: 0,
							count: 0,
							totalOT: 0,
							totalLeave: 0,
							totalAbsence: 0,
						});
					}
					const provData = performanceByProvinceMap.get(provinceIdStr)!;
					provData.totalPerf += emp.performance.dailyPerformance || 0;
					provData.count++;
					provData.totalOT += emp.performance.overtime || 0;
					provData.totalLeave += emp.performance.dailyLeave || 0;
					provData.totalAbsence += emp.performance.absence || 0;
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

			// Convert rank by province map to array
			stats.employeeDistribution.byRankByProvince = Array.from(rankByProvinceMap.entries())
				.map(([provinceId, rankMap]) => {
					const province = provinces.find((p) => p._id.toString() === provinceId);
					const rankArray = Array.from(rankMap.entries())
						.map(([rank, count]) => ({ rank, count }))
						.sort((a, b) => b.count - a.count);
					return {
						province: province?.name || "Unknown",
						total: rankArray.reduce((sum, r) => sum + r.count, 0),
						data: rankArray,
					};
				})
				.sort((a, b) => b.total - a.total);

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
				stats.globalPerformanceMetrics.averageDailyPerformance = Math.round((totalPerformance / performanceCount) * 100) / 100;
			}

			// Build performance metrics by province
			stats.performanceMetricsByProvince = Array.from(performanceByProvinceMap.entries())
				.map(([provinceId, data]) => {
					const province = provinces.find((p) => p._id.toString() === provinceId);
					return {
						province: province?.name || "Unknown",
						data: {
							averageDailyPerformance: data.count > 0 ? Math.round((data.totalPerf / data.count) * 100) / 100 : 0,
							totalOvertimeHours: data.totalOT,
							totalLeaveHours: data.totalLeave,
							totalAbsenceHours: data.totalAbsence,
							employeeCount: data.count,
						},
					};
				})
				.sort((a, b) => b.data.employeeCount - a.data.employeeCount);

			// Build absence overview by branch and by province
			employees.forEach((emp) => {
				const branch = emp.workPlace?.branch || "Unknown";
				const provinceIdStr = (emp.provinceId as any)?._id?.toString() || emp.provinceId.toString();

				// Track by province
				if (!absenceByProvinceMap.has(provinceIdStr)) {
					absenceByProvinceMap.set(provinceIdStr, new Map());
				}
				const provinceAbsenceMap = absenceByProvinceMap.get(provinceIdStr)!;
				const current = provinceAbsenceMap.get(branch) || { absence: 0, leave: 0, overtime: 0 };
				current.absence += emp.performance?.absence || 0;
				current.leave += emp.performance?.dailyLeave || 0;
				current.overtime += emp.performance?.overtime || 0;
				provinceAbsenceMap.set(branch, current);
			});

			stats.absenceOverviewByProvince = Array.from(absenceByProvinceMap.entries())
				.map(([provinceId, branchAbsenceMap]) => {
					const province = provinces.find((p) => p._id.toString() === provinceId);
					return {
						province: province?.name || "Unknown",
						data: Array.from(branchAbsenceMap.entries())
							.map(([branch, data]) => ({
								name: branch,
								totalAbsenceHours: data.absence,
								totalLeaveHours: data.leave,
								totalOvertimeHours: data.overtime,
							}))
							.sort((a, b) => b.totalAbsenceHours - a.totalAbsenceHours),
					};
				})
				.sort((a, b) => {
					const totalA = a.data.reduce((sum, d) => sum + d.totalAbsenceHours, 0);
					const totalB = b.data.reduce((sum, d) => sum + d.totalAbsenceHours, 0);
					return totalB - totalA;
				});

			sendSuccess(res, stats);
		} catch (err) {
			logger.error("Error fetching admin dashboard stats:", err);
			sendError(res, "Failed to fetch dashboard statistics", 500);
		}
	}
);

export default router;
