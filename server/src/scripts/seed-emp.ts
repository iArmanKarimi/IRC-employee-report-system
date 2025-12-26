import { connectDB } from '../data-source';
import { Employee } from '../models/Employee';
import { Province } from '../models/Province';

async function seedEmployees() {
	await connectDB();

	// Fetch all provinces from the database
	const provinces = await Province.find();
	if (!provinces || provinces.length === 0) {
		console.error('No provinces found in the database. Please seed provinces first.');
		process.exit(1);
	}

	for (const province of provinces) {
		const provinceId = province._id;
		// Generate 25 sample employees for each province
		const employees = Array.from({ length: 25 }, (_, i) => {
			const male = i % 2 === 0;
			const married = i % 3 === 0;
			const childrenCount = married ? (i % 4) : 0;
			const firstName = male ? `John${i}` : `Jane${i}`;
			const lastName = male ? `Doe${i}` : `Smith${i}`;
			// Make nationalID unique per province and employee
			const nationalID = `NID${provinceId.toString().slice(-3)}${100000000 + i}`;
			const branch = ["Central", "West", "East", "North", "South"][i % 5];
			const rank = ["Manager", "Technician", "Staff", "Supervisor", "Clerk"][i % 5];
			const licensedWorkplace = `Workplace${i % 3}`;
			const educationalDegree = ["MBA", "BSc", "PhD", "Diploma", "BA"][i % 5];
			const dateOfBirth = new Date(1980 + (i % 20), (i % 12), (i % 28) + 1);
			const contactNumber = `09${(100000000 + i).toString().padStart(8, '0')}`;
			const jobStartDate = new Date(2010 + (i % 10), (i % 12), (i % 28) + 1);
			const dailyPerformance = 5 + (i % 6);
			const shiftCountPerLocation = 1 + (i % 3);
			const shiftDuration = [8, 16, 24][i % 3];
			const overtime = i % 4;
			const dailyLeave = i % 2;
			const sickLeave = (i + 1) % 3;
			const absence = i % 2;
			const truckDriver = i % 5 === 0;
			const travelAssignment = i % 10;
			const status = ["active", "inactive", "on_leave"][i % 3];
			const notes = `Sample employee ${i}`;
			return {
				provinceId,
				basicInfo: {
					firstName,
					lastName,
					nationalID,
					male,
					married,
					childrenCount,
				},
				workPlace: {
					branch,
					rank,
					licensedWorkplace,
				},
				additionalSpecifications: {
					educationalDegree,
					dateOfBirth,
					contactNumber,
					jobStartDate,
					truckDriver,
				},
				performance: {
					dailyPerformance,
					shiftCountPerLocation,
					shiftDuration,
					overtime,
					dailyLeave,
					sickLeave,
					absence,
					travelAssignment,
					status,
					notes,
				},
			};
		});

		for (const empData of employees) {
			const employee = new Employee(empData);
			await employee.save();
			console.log(`Seeded employee: ${empData.basicInfo.firstName} ${empData.basicInfo.lastName} for province ${province.name || province._id}`);
		}
	}

	console.log('Employee seeding complete.');
	process.exit(0);
}

seedEmployees().catch((err) => {
	console.error('Error seeding employees:', err);
	process.exit(1);
});
