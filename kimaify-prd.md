# Kimaify — Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Kimaify  
**Product Type:** Web Application  
**Primary Purpose:** Bulk timesheet creation for Kimai

Kimaify is a web application designed to simplify timesheet entry in Kimai. Instead of manually creating timesheet entries one by one through the Kimai interface, users can prepare and submit multiple timesheet activities at once through a single bulk-entry workflow.

Kimaify communicates directly with the existing Kimai API and requires users to provide their **Kimai Bearer Token** before accessing timesheet data or performing any operation.

### Problem

The standard Kimai workflow requires users to create timesheet activities individually. When a user needs to record many activities for a day or a project, this becomes repetitive and time-consuming.

### Solution

Kimaify provides a bulk-entry interface where users can prepare multiple timesheet entries and submit them together.

---

## 2. Goals

### Primary Goals

1. Allow users to authenticate using their Kimai Bearer Token.
2. Display the user's existing timesheet activities.
3. Allow users to create multiple timesheet entries in a single workflow.
4. Reduce repetitive manual input when filling timesheets.
5. Reuse Kimai's existing customers, projects, activities, and tags.
6. Submit timesheet entries directly to Kimai through its API.

### Secondary Goals

- Provide a clean and fast timesheet-entry experience.
- Make it easy to duplicate/reuse entries.
- Minimize the number of interactions required to fill a workday.
- Provide clear validation and API error feedback.

### Non-Goals

Kimaify will **not**:

- Replace Kimai's timesheet management functionality.
- Manage users or permissions.
- Create or modify Kimai customers.
- Create or modify Kimai projects.
- Create or modify Kimai activities.
- Manage Kimai configuration.
- Become a full-featured timesheet management system.

---

## 3. Target User

Primary users are **developers/employees who use Kimai to record their daily work activities** and frequently need to enter multiple timesheet records.

Typical workflow:

```text
Workday
   ↓
Complete several tasks
   ↓
Open Kimaify
   ↓
Prepare multiple timesheet entries
   ↓
Review
   ↓
Submit
   ↓
Entries are created in Kimai
```

---

## 4. Authentication

All Kimaify operations that communicate with Kimai require a **Bearer Token**.

### Authentication Flow

```text
User opens Kimaify
        ↓
No token found
        ↓
Token Sign In Page
        ↓
User enters Kimai Token
        ↓
Kimaify validates token
        ↓
Token valid?
   ┌────┴────┐
  Yes        No
   ↓          ↓
Homepage   Show error
```

### Sign In Page

| Field | Type | Required |
|---|---|---|
| Kimai Token | Password/Text | Yes |

### Authentication Requirements

- Token must be stored securely.
- Token must be attached as:
  ```http
  Authorization: Bearer <TOKEN>
  ```
- Invalid or expired tokens should result in a clear authentication error.
- Users should be able to sign out.
- On sign out, the locally stored token should be removed.

### Security Requirements

Kimaify should **never expose the token in URLs, query parameters, logs, analytics events, or error messages**.

---

## 5. API Integration

Kimaify uses the existing Kimai API.

**Base URL:**

```text
https://timesheet.codeoffice.net/api
```

All endpoints require:

```http
Authorization: Bearer <TOKEN>
```

### 5.1 Get Timesheets

**Method:** `GET`

**Endpoint:**

```text
/api/timesheets
```

**Purpose:**

- Display existing timesheet entries.
- Provide users with visibility into what has already been recorded.
- Potentially help users avoid duplicate entries.

### 5.2 Get Tags

**Method:** `GET`

**Endpoint:**

```text
/api/tags
```

**Purpose:**

Retrieve available Kimai tags for the create-timesheet form.

### 5.3 Get Activities

**Method:** `GET`

**Endpoint:**

```text
/api/activities
```

**Purpose:**

Retrieve available activities that can be assigned to a timesheet entry.

### 5.4 Get Customers

**Method:** `GET`

**Endpoint:**

```text
/api/customers
```

**Purpose:**

Retrieve available customers.

Customers are used as the first level of project selection.

### 5.5 Get Projects

**Method:** `GET`

**Endpoint:**

```text
/api/projects?customer={customerId}
```

**Example:**

```text
/api/projects?customer=1
```

**Purpose:**

Retrieve projects belonging to a selected customer.

**Dependency:**

```text
Customer
   ↓
Customer ID
   ↓
GET /projects?customer={id}
   ↓
Project options
```

The project dropdown should therefore be **dependent on the selected customer**.

### 5.6 Create Timesheet

**Method:** `POST`

**Endpoint:**

```text
/api/timesheets
```

**Payload:**

```json
{
  "begin": "2026-08-12T01:00:00.000Z",
  "end": "2026-08-12T03:00:00.000Z",
  "project": 42,
  "activity": 20,
  "description": "Ecom Docs",
  "tags": ""
}
```

### Payload Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `begin` | ISO datetime | Yes | Start time |
| `end` | ISO datetime | Yes | End time |
| `project` | Integer | Yes | Kimai project ID |
| `activity` | Integer | Yes | Kimai activity ID |
| `description` | String | No | Timesheet description |
| `tags` | String | No | Timesheet tags |

---

## 6. Core Feature — Bulk Timesheet Entry

This is the **main feature of Kimaify**.

Instead of opening a create modal repeatedly, users can create multiple timesheet rows in one screen.

### Example

| Start | End | Customer | Project | Activity | Description |
|---|---|---|---|---|---|
| 08:00 | 09:00 | Volta | Ecom | Development | Implement login |
| 09:00 | 10:00 | Volta | Ecom | Development | API integration |
| 10:00 | 11:00 | Volta | Ecom | Documentation | Update API docs |
| 13:00 | 14:00 | Volta | Dashboard | Meeting | Sprint planning |

User clicks:

**Create 4 Entries**

Kimaify then submits the four records to Kimai.

---

## 7. Homepage

The homepage is the main workspace after authentication.

### Main Components

```text
┌───────────────────────────────────────────────┐
│ Kimaify                              [Logout] │
├───────────────────────────────────────────────┤
│                                               │
│ Timesheets                    [+ Add Activity]│
│                                               │
│ ┌───────────────────────────────────────────┐ │
│ │ Date │ Time │ Project │ Activity │ Desc. │ │
│ ├───────────────────────────────────────────┤ │
│ │ ...                                       │ │
│ │ ...                                       │ │
│ └───────────────────────────────────────────┘ │
│                                               │
└───────────────────────────────────────────────┘
```

### Homepage Responsibilities

- Fetch existing timesheets.
- Display timesheet records.
- Provide access to bulk creation.
- Allow users to review newly created records.
- Provide logout functionality.

---

## 8. Create Timesheet Bulk Form

The create interface should allow users to add multiple entries.

### Basic Fields

Each entry contains:

```text
Start Time
End Time
Customer
Project
Activity
Description
Tags
```

### Customer → Project Dependency

When the user selects a customer:

```text
Customer: Volta
```

Kimaify fetches:

```http
GET /projects?customer=<customer_id>
```

Then populates the Project dropdown.

---

## 9. Bulk Entry UX

A **table-based editor** is recommended because it better matches the bulk-entry purpose.

### Recommended Interface

```text
┌────────┬────────┬──────────┬──────────┬──────────┬──────────────┐
│ Start  │ End    │ Customer │ Project  │ Activity │ Description  │
├────────┼────────┼──────────┼──────────┼──────────┼──────────────┤
│ 08:00  │ 09:00  │ Volta    │ Ecom     │ Dev      │ Login        │
│ 09:00  │ 10:00  │ Volta    │ Ecom     │ Dev      │ API          │
│ 10:00  │ 11:00  │ Volta    │ Dashboard│ Docs     │ Documentation│
└────────┴────────┴──────────┴──────────┴──────────┴──────────────┘

[+ Add Row]                         [Create 3 Entries]
```

### Row Operations

Each row should support:

- Add row.
- Edit row.
- Remove row.
- Duplicate row.
- Reorder row, if practical.

---

## 10. Bulk Submission

When the user clicks **Create All**, Kimaify should:

1. Validate all rows.
2. Prevent submission if required fields are missing.
3. Display a confirmation/review state.
4. Submit each entry to `POST /timesheets`.
5. Track success/failure for each entry.
6. Refresh the homepage after completion.

### Example

```text
Creating Timesheets...

✓ Entry #1 created
✓ Entry #2 created
✓ Entry #3 created
✗ Entry #4 failed

3 of 4 entries created successfully.
```

Kimaify should not treat a partial failure as a complete failure.

---

## 11. Validation

### Required Fields

Each row should validate:

- Start time.
- End time.
- Customer.
- Project.
- Activity.

### Time Validation

```text
end > begin
```

Invalid:

```text
08:00 → 07:00
```

Valid:

```text
08:00 → 09:00
```

### Additional Validation

The application should prevent:

- Empty required fields.
- Invalid date/time.
- End time earlier than start time.
- Invalid project/activity selections.
- Obvious accidental duplicate rows.

---

## 12. Error Handling

Kimaify should distinguish between different failure types.

### Authentication Error

```text
Your Kimai token is invalid or expired.
Please sign in again.
```

### Validation Error

```text
Please complete all required fields.
```

### API Error

```text
Failed to create this timesheet entry.
Please try again.
```

### Partial Failure

```text
4 entries submitted

✓ 3 created successfully
✗ 1 failed

[Retry Failed]
```

The **Retry Failed** functionality is recommended because users should not have to recreate entries that were already successfully submitted.

---

## 13. Data Flow

### Initial Application Load

```text
Kimaify
   ↓
Check stored token
   ↓
Token exists?
 ┌──────┴──────┐
 No           Yes
 ↓             ↓
Login       GET /timesheets
               ↓
            Homepage
```

### Create Flow

```text
User clicks Add Activity
        ↓
Fetch:
- Customers
- Activities
- Tags
        ↓
User selects Customer
        ↓
GET /projects?customer={id}
        ↓
User fills timesheet
        ↓
Add another row
        ↓
Repeat
        ↓
Review
        ↓
Create All
        ↓
POST /timesheets × N
        ↓
Show result
        ↓
Refresh timesheets
```

---

## 14. API Requirements Summary

| Feature | Method | Endpoint | Purpose |
|---|---|---|---|
| Get Timesheets | GET | `/timesheets` | Display existing entries |
| Get Tags | GET | `/tags` | Populate tags |
| Get Activities | GET | `/activities` | Populate activities |
| Get Customers | GET | `/customers` | Populate customers |
| Get Projects | GET | `/projects?customer={id}` | Populate projects |
| Create Timesheet | POST | `/timesheets` | Create entry |

All requests must include:

```http
Authorization: Bearer <KIMAI_TOKEN>
```

---

## 15. MVP Scope

### Must Have

- [ ] Token-based authentication.
- [ ] Secure token storage.
- [ ] Logout.
- [ ] Get existing timesheets.
- [ ] Get customers.
- [ ] Get projects by customer.
- [ ] Get activities.
- [ ] Get tags.
- [ ] Add multiple timesheet rows.
- [ ] Edit/remove rows before submission.
- [ ] Validate rows.
- [ ] Bulk submit.
- [ ] Per-row success/failure status.
- [ ] Refresh timesheets after submission.

### Nice to Have

- [ ] Duplicate row.
- [ ] Copy previous day's entries.
- [ ] Default date.
- [ ] Default customer/project.
- [ ] Remember frequently used project/activity.
- [ ] Retry failed submissions.
- [ ] Keyboard shortcuts.
- [ ] Drag-to-reorder rows.
- [ ] Timesheet templates.

### Future Features

A potential future feature is:

**Generate today's timesheet from a template.**

Example:

```text
Template: Normal Workday

08:00–09:00  Development
09:00–10:00  Development
10:00–11:00  Documentation
11:00–12:00  Development
13:00–14:00  Meeting
14:00–17:00  Development
```

Users would only need to adjust descriptions, projects, or activities before submitting.

---

## 16. Success Metrics

The primary metric should be **time saved per timesheet submission**.

### Example

Current Kimai workflow:

```text
10 entries
×
~30–60 seconds per entry
=
5–10 minutes
```

Kimaify target:

```text
10 entries
↓
Bulk input
↓
One submission
=
< 2 minutes
```

### Potential KPIs

- Average number of entries created per bulk operation.
- Average time required to create a day's timesheet.
- Percentage of bulk submissions completed successfully.
- Number of active users.
- Number of timesheet entries created through Kimaify.

---

## 17. Recommended Technical Architecture

Kimaify is essentially a lightweight Kimai API client.

### Option A — Direct API

```text
┌──────────────────────┐
│      Kimaify Web     │
│                      │
│  React / Next.js     │
└──────────┬───────────┘
           │
           │ Bearer Token
           ▼
┌──────────────────────┐
│     Kimai API        │
│                      │
│ /timesheets          │
│ /customers           │
│ /projects            │
│ /activities          │
│ /tags                │
└──────────────────────┘
```

This is suitable for an MVP if the Kimai API supports the required browser-origin requests and CORS configuration.

### Option B — Backend-for-Frontend (Recommended for Production)

```text
Browser
   ↓
Kimaify BFF
   ↓
Kimai API
```

A thin BFF provides more control over:

- Token handling.
- API normalization.
- Error handling.
- Rate limiting.
- Logging.
- Future application features.

For production, the BFF approach is recommended if the infrastructure allows it.

---

## 18. Product Positioning

The simplest way to describe Kimaify:

> **Kimaify is a bulk timesheet entry tool for Kimai that lets users create multiple activities at once instead of entering them individually.**

### Core UX Principle

> **Prepare many → Review once → Submit once.**

The product's key differentiator is not simply creating a timesheet. It is **creating many timesheets with minimal friction**.
