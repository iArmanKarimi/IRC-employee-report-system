# IRC Employee Management System

A lightweight, role‑based employee management system designed for organizations with a **Global Admin** and fixed **Province Admins**.  
The system provides a clean separation of access, scoped data visibility, and a simple front‑end flow.

---

## 🚀 Overview

The system manages employees across multiple provinces.  
There are **only two roles**:

- **Global Admin** — can view all provinces and browse employees within any province.
- **Province Admin** — can only manage employees within _their own_ province.

Province admins themselves are **fixed** (not created through the UI or API).

---

## 🗂️ Core Features

- Secure login (`/auth/login`)
- Global Admin dashboard showing all provinces
- Province‑scoped employee management
- Create, edit, delete employees (province‑scoped)
- Fetch employees belonging to a selected province
- No generic `/employees` root — everything is province‑scoped

---

## 🧩 API Structure

All employee data is nested under provinces.

### **Authentication**

| Method | Endpoint      | Description                             |
| ------ | ------------- | --------------------------------------- |
| POST   | `/auth/login` | Login as Global Admin or Province Admin |

---

## **🔹 Provinces**

| Method | Endpoint                 | Description                            |
| ------ | ------------------------ | -------------------------------------- |
| GET    | `/provinces`             | List all provinces (Global Admin only) |
| GET    | `/provinces/:provinceId` | Get details of a specific province     |

---

## **🔹 Employees (Province‑Scoped)**

All employee operations must include the province they belong to.

| Method | Endpoint                                       | Description                           |
| ------ | ---------------------------------------------- | ------------------------------------- |
| GET    | `/provinces/:provinceId/employees`             | List all employees of the province    |
| POST   | `/provinces/:provinceId/employees`             | Create a new employee in the province |
| GET    | `/provinces/:provinceId/employees/:employeeId` | Fetch a single employee               |
| PUT    | `/provinces/:provinceId/employees/:employeeId` | Update an employee                    |
| DELETE | `/provinces/:provinceId/employees/:employeeId` | Delete an employee                    |

---

## 🧭 Front-End Flow

### **1. Login Page (`/`)**

- User enters credentials
- Sends POST → `/auth/login`
- Redirects based on role

---

### **2. Global Admin Flow**

**GlobalAdminDashboardPage**

Displays a list of all provinces (`GET /provinces`).

User selects a province → redirect to:

`/provinces/:provinceId/employees`

Which loads the employee list for that province.

---

### **3. Province Admin Flow**

**ProvinceEmployeesPage**

Displays all employees of their province:

`GET /provinces/:provinceId/employees`

Actions:

- "Create Employee" → `NewEmployeeFormPage`
- Select employee → `EmployeePage` (`/provinces/:provinceId/employees/:employeeId`)

---

## 📦 Data Model

### **User**

```
{
  id: string,
  email: string,
  password: string (hashed),
  role: "global" | "province",
  provinceId?: string
}
```

### **Province**

```
{
  id: string,
  name: string
}
```

### **Employee**

```
{
  id: string,
  firstName: string,
  lastName: string,
  phone: string,
  nationalId: string,
  provinceId: string
}
```

Employees always reference the province they belong to.

---

## 🎯 Design Principles

- **Minimalistic & strict**: no unnecessary endpoints
- **100% province‑scoped employees**
- **Global admin ≠ province admin list viewer**
- **Predictable URL structure**
- **Easy to port into any client framework**

---

## 📘 Summary

This system provides:

- Clean role‑based structure
- Simple routes
- Hierarchical API (`/provinces → employees`)
- No redundant admin management
- Production‑ready separation of access

Perfect for organizational employee management with fixed province administration.

---
