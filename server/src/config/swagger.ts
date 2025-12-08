/**
 * Swagger/OpenAPI documentation configuration for the IRC Employee Management System
 */

const swaggerDefinition = {
	openapi: "3.0.0",
	info: {
		title: "IRC Employee Management System API",
		version: "1.0.0",
		description: "API for managing employees across provinces with role-based access control"
	},
	servers: [
		{
			url: "http://localhost:3000",
			description: "Development server"
		},
		{
			url: "https://api.example.com",
			description: "Production server"
		}
	],
	components: {
		schemas: {
			User: {
				type: "object",
				properties: {
					role: {
						type: "string",
						enum: ["globalAdmin", "provinceAdmin"],
						description: "User role"
					},
					provinceId: {
						type: "string",
						nullable: true,
						description: "Province ID (only for Province Admins)"
					}
				}
			},
			Province: {
				type: "object",
				properties: {
					_id: { type: "string" },
					name: { type: "string" },
					admin: { type: "string", description: "User ID of the admin" },
					employees: {
						type: "array",
						items: { type: "string" },
						description: "Array of employee IDs"
					}
				}
			},
			Employee: {
				type: "object",
				properties: {
					_id: { type: "string" },
					provinceId: { type: "string" },
					basicInfo: {
						type: "object",
						properties: {
							firstName: { type: "string" },
							lastName: { type: "string" },
							nationalID: { type: "string" },
							male: { type: "boolean" },
							married: { type: "boolean" },
							childrenCount: { type: "integer" }
						}
					},
					workPlace: {
						type: "object",
						properties: {
							provinceName: { type: "string" },
							branch: { type: "string" },
							rank: { type: "string" },
							licensedWorkplace: { type: "string" },
							travelAssignment: { type: "boolean" }
						}
					},
					additionalSpecifications: { type: "object" },
					performances: { type: "array" },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" }
				}
			},
			ErrorResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: false },
					error: { type: "string" }
				}
			},
			SuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					data: { type: "object" },
					message: { type: "string" }
				}
			}
		},
		securitySchemes: {
			sessionCookie: {
				type: "apiKey",
				in: "cookie",
				name: "irc.sid",
				description: "Session cookie for authentication"
			}
		}
	},
	security: [{ sessionCookie: [] }],
	paths: {
		"/auth/login": {
			post: {
				tags: ["Authentication"],
				summary: "User login",
				description: "Authenticate user with username and password",
				security: [],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									username: { type: "string" },
									password: { type: "string" }
								},
								required: ["username", "password"]
							}
						}
					}
				},
				responses: {
					200: {
						description: "Login successful",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean" },
										data: { $ref: "#/components/schemas/User" },
										message: { type: "string" }
									}
								}
							}
						}
					},
					401: {
						description: "Invalid credentials",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" }
							}
						}
					}
				}
			}
		},
		"/auth/logout": {
			post: {
				tags: ["Authentication"],
				summary: "User logout",
				description: "Destroy session and logout user",
				responses: {
					200: {
						description: "Logout successful",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/SuccessResponse" }
							}
						}
					}
				}
			}
		},
		"/provinces": {
			get: {
				tags: ["Provinces"],
				summary: "List all provinces",
				description: "Retrieve all provinces (Global Admin only)",
				responses: {
					200: {
						description: "List of provinces",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean" },
										data: {
											type: "array",
											items: { $ref: "#/components/schemas/Province" }
										}
									}
								}
							}
						}
					},
					403: {
						description: "Forbidden - requires Global Admin role",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" }
							}
						}
					}
				}
			}
		},
		"/provinces/{provinceId}": {
			get: {
				tags: ["Provinces"],
				summary: "Get province details",
				parameters: [
					{
						name: "provinceId",
						in: "path",
						required: true,
						schema: { type: "string" }
					}
				],
				responses: {
					200: {
						description: "Province details",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean" },
										data: { $ref: "#/components/schemas/Province" }
									}
								}
							}
						}
					},
					404: {
						description: "Province not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" }
							}
						}
					}
				}
			}
		},
		"/provinces/{provinceId}/employees": {
			get: {
				tags: ["Employees"],
				summary: "List employees in a province",
				parameters: [
					{
						name: "provinceId",
						in: "path",
						required: true,
						schema: { type: "string" }
					}
				],
				responses: {
					200: {
						description: "List of employees",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean" },
										data: {
											type: "array",
											items: { $ref: "#/components/schemas/Employee" }
										}
									}
								}
							}
						}
					},
					403: {
						description: "Cannot access employees from another province",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" }
							}
						}
					}
				}
			},
			post: {
				tags: ["Employees"],
				summary: "Create new employee",
				parameters: [
					{
						name: "provinceId",
						in: "path",
						required: true,
						schema: { type: "string" }
					}
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/Employee" }
						}
					}
				},
				responses: {
					201: {
						description: "Employee created successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean" },
										data: { $ref: "#/components/schemas/Employee" }
									}
								}
							}
						}
					},
					403: {
						description: "Cannot create employee in another province",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" }
							}
						}
					}
				}
			}
		},
		"/provinces/{provinceId}/employees/{employeeId}": {
			get: {
				tags: ["Employees"],
				summary: "Get employee details",
				parameters: [
					{
						name: "provinceId",
						in: "path",
						required: true,
						schema: { type: "string" }
					},
					{
						name: "employeeId",
						in: "path",
						required: true,
						schema: { type: "string" }
					}
				],
				responses: {
					200: {
						description: "Employee details",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean" },
										data: { $ref: "#/components/schemas/Employee" }
									}
								}
							}
						}
					},
					404: {
						description: "Employee not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" }
							}
						}
					}
				}
			},
			put: {
				tags: ["Employees"],
				summary: "Update employee",
				parameters: [
					{
						name: "provinceId",
						in: "path",
						required: true,
						schema: { type: "string" }
					},
					{
						name: "employeeId",
						in: "path",
						required: true,
						schema: { type: "string" }
					}
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/Employee" }
						}
					}
				},
				responses: {
					200: {
						description: "Employee updated successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean" },
										data: { $ref: "#/components/schemas/Employee" }
									}
								}
							}
						}
					},
					404: {
						description: "Employee not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" }
							}
						}
					}
				}
			},
			delete: {
				tags: ["Employees"],
				summary: "Delete employee",
				parameters: [
					{
						name: "provinceId",
						in: "path",
						required: true,
						schema: { type: "string" }
					},
					{
						name: "employeeId",
						in: "path",
						required: true,
						schema: { type: "string" }
					}
				],
				responses: {
					200: {
						description: "Employee deleted successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/SuccessResponse" }
							}
						}
					},
					404: {
						description: "Employee not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" }
							}
						}
					}
				}
			}
		}
	}
};

export default swaggerDefinition;
