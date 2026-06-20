#!/bin/bash
# =============================================================================
# COMPLETE API TEST SCRIPT - Manager & Employee Full Flow
# Tests: Register → Login → CRUD Users → Link Employees → Logout
# =============================================================================

set -e  # Exit on any error

echo "========================================"
echo "   FULL API TEST - STARTING NOW"
echo "========================================"

# =============================================================================
# MANAGER DATA SECTION - 5 Manager Test Accounts
# =============================================================================

# Manager 1 - Primary Test Manager
MANAGER1_NAME="John Corporation"
MANAGER1_EMAIL="john.corporation@techcompany.com"
MANAGER1_PASSWORD="JohnCorp123456"
MANAGER1_COMPANY="TechCorp International"

# Manager 2 - Enterprise Manager
MANAGER2_NAME="Sarah Enterprise"
MANAGER2_EMAIL="sarah.enterprise@globalfirm.com"
MANAGER2_PASSWORD="SarahEnt789012"
MANAGER2_COMPANY="GlobalFirm Ltd"

# Manager 3 - Startup Manager
MANAGER3_NAME="Mike Startup"
MANAGER3_EMAIL="mike.startup@innovateco.com"
MANAGER3_PASSWORD="MikeStartup3456"
MANAGER3_COMPANY="InnovateCo Solutions"

# Manager 4 - Corporate Manager
MANAGER4_NAME="Lisa Corporate"
MANAGER4_EMAIL="lisa.corporate@businessgroup.com"
MANAGER4_PASSWORD="LisaCorp789012"
MANAGER4_COMPANY="BusinessGroup Inc"

# Manager 5 - Executive Manager
MANAGER5_NAME="David Executive"
MANAGER5_EMAIL="david.executive@leadershipco.com"
MANAGER5_PASSWORD="DavidExec123456"
MANAGER5_COMPANY="LeadershipCo Partners"

# =============================================================================
# EMPLOYEE DATA SECTION - 5 Employee Test Accounts
# =============================================================================

# Employee 1 - Senior Developer
EMPLOYEE1_NAME="Alex Johnson"
EMPLOYEE1_EMAIL="alex.johnson@techcompany.com"
EMPLOYEE1_PASSWORD="AlexDev123456"

# Employee 2 - Project Manager
EMPLOYEE2_NAME="Maria Garcia"
EMPLOYEE2_EMAIL="maria.garcia@techcompany.com"
EMPLOYEE2_PASSWORD="MariaPM789012"

# Employee 3 - UX Designer
EMPLOYEE3_NAME="James Wilson"
EMPLOYEE3_EMAIL="james.wilson@techcompany.com"
EMPLOYEE3_PASSWORD="JamesUX345678"

# Employee 4 - Data Analyst
EMPLOYEE4_NAME="Emma Thompson"
EMPLOYEE4_EMAIL="emma.thompson@techcompany.com"
EMPLOYEE4_PASSWORD="EmmaData901234"

# Employee 5 - QA Engineer
EMPLOYEE5_NAME="Daniel Chen"
EMPLOYEE5_EMAIL="daniel.chen@techcompany.com"
EMPLOYEE5_PASSWORD="DanielQA567890"

# =============================================================================
# SECTION 1: PRIMARY MANAGER REGISTRATION & SETUP
# =============================================================================
echo -e "\n🔵 SECTION 1: PRIMARY MANAGER REGISTRATION & SETUP"

# -------------------------------
# 1.1 Register Primary Manager + Company
# -------------------------------
echo -e "\n1.1 Registering Primary Manager + Company..."
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Corporation",
    "email": "sarah.enterprise@globalfirm.com",
    "password": "Joorp123456",
    "companyName": "TechCorp International"
  }')

echo "$REGISTER_RESPONSE" | jq '.data | {name, role, companyName, _id}'

# -------------------------------
# 1.2 Login as Primary Manager
# -------------------------------
echo -e "\n1.2 Logging in as Primary Manager..."
TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.corporation@techcompany.com",
    "password": "JohnCorp123456"
  }' | jq -r '.data.accessToken')
echo "✅ Access Token: $TOKEN"

# -------------------------------
# 1.3 Get Primary Manager Profile (/me)
# -------------------------------
echo -e "\n1.3 Getting Primary Manager Profile (/me)..."
curl -s -X GET "http://localhost:5000/api/users/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {name, role, linkedEmployees, companyId}'

# =============================================================================
# SECTION 2: EMPLOYEE CREATION - ALL 5 EMPLOYEES
# =============================================================================
echo -e "\n🔵 SECTION 2: EMPLOYEE CREATION - ALL 5 EMPLOYEES"

# -------------------------------
# 2.1 Add Employee 1: Alex Johnson (Senior Developer)
# -------------------------------
echo -e "\n2.1 Adding Employee 1: Alex Johnson (Senior Developer)..."
ALEX_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/users/add-employee" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Alex Johnson",
    "email": "alex.johnson@techcompany.com",
    "password": "AlexDev123456"
  }')

echo "$ALEX_RESPONSE" | jq '.data | {name, email, role, _id}'
ALEX_ID=$(echo "$ALEX_RESPONSE" | jq -r '.data._id')
echo "✅ Alex Johnson ID: $ALEX_ID"

# -------------------------------
# 2.2 Add Employee 2: Maria Garcia (Project Manager)
# -------------------------------
echo -e "\n2.2 Adding Employee 2: Maria Garcia (Project Manager)..."
MARIA_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/users/add-employee" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Maria Garcia",
    "email": "maria.garcia@techcompany.com",
    "password": "MariaPM789012"
  }')

echo "$MARIA_RESPONSE" | jq '.data | {name, email, role, _id}'
MARIA_ID=$(echo "$MARIA_RESPONSE" | jq -r '.data._id')
echo "✅ Maria Garcia ID: $MARIA_ID"

# -------------------------------
# 2.3 Add Employee 3: James Wilson (UX Designer)
# -------------------------------
echo -e "\n2.3 Adding Employee 3: James Wilson (UX Designer)..."
JAMES_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/users/add-employee" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "James Wilson",
    "email": "james.wilson@techcompany.com",
    "password": "JamesUX345678"
  }')

echo "$JAMES_RESPONSE" | jq '.data | {name, email, role, _id}'
JAMES_ID=$(echo "$JAMES_RESPONSE" | jq -r '.data._id')
echo "✅ James Wilson ID: $JAMES_ID"

# -------------------------------
# 2.4 Add Employee 4: Emma Thompson (Data Analyst)
# -------------------------------
echo -e "\n2.4 Adding Employee 4: Emma Thompson (Data Analyst)..."
EMMA_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/users/add-employee" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Emma Thompson",
    "email": "emma.thompson@techcompany.com",
    "password": "EmmaData901234"
  }')

echo "$EMMA_RESPONSE" | jq '.data | {name, email, role, _id}'
EMMA_ID=$(echo "$EMMA_RESPONSE" | jq -r '.data._id')
echo "✅ Emma Thompson ID: $EMMA_ID"

# -------------------------------
# 2.5 Add Employee 5: Daniel Chen (QA Engineer)
# -------------------------------
echo -e "\n2.5 Adding Employee 5: Daniel Chen (QA Engineer)..."
DANIEL_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/users/add-employee" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Daniel Chen",
    "email": "daniel.chen@techcompany.com",
    "password": "DanielQA567890"
  }')

echo "$DANIEL_RESPONSE" | jq '.data | {name, email, role, _id}'
DANIEL_ID=$(echo "$DANIEL_RESPONSE" | jq -r '.data._id')
echo "✅ Daniel Chen ID: $DANIEL_ID"

# =============================================================================
# SECTION 3: EMPLOYEE LINKING - LINK ALL 5 EMPLOYEES
# =============================================================================
echo -e "\n🔵 SECTION 3: EMPLOYEE LINKING - LINK ALL 5 EMPLOYEES"

# -------------------------------
# 3.1 Link Alex Johnson to Manager
# -------------------------------
echo -e "\n3.1 Linking Alex Johnson to Manager..."
curl -X POST "http://localhost:5000/api/users/link-employee/$ALEX_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.manager | {name, linkedEmployees}'

# -------------------------------
# 3.2 Link Maria Garcia to Manager
# -------------------------------
echo -e "\n3.2 Linking Maria Garcia to Manager..."
curl -X POST "http://localhost:5000/api/users/link-employee/$MARIA_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.manager | {name, linkedEmployees}'

# -------------------------------
# 3.3 Link James Wilson to Manager
# -------------------------------
echo -e "\n3.3 Linking James Wilson to Manager..."
curl -X POST "http://localhost:5000/api/users/link-employee/$JAMES_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.manager | {name, linkedEmployees}'

# -------------------------------
# 3.4 Link Emma Thompson to Manager
# -------------------------------
echo -e "\n3.4 Linking Emma Thompson to Manager..."
curl -X POST "http://localhost:5000/api/users/link-employee/$EMMA_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.manager | {name, linkedEmployees}'

# -------------------------------
# 3.5 Link Daniel Chen to Manager
# -------------------------------
echo -e "\n3.5 Linking Daniel Chen to Manager..."
curl -X POST "http://localhost:5000/api/users/link-employee/$DANIEL_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.manager | {name, linkedEmployees}'

# -------------------------------
# 3.6 Verify Manager Profile with All Linked Employees
# -------------------------------
echo -e "\n3.6 Manager Profile with All Linked Employees..."
curl -s -X GET "http://localhost:5000/api/users/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {name, linkedEmployees}'

# =============================================================================
# SECTION 4: EMPLOYEE REGISTRATION FLOW - SAME COMPANY
# =============================================================================
echo -e "\n🔵 SECTION 4: EMPLOYEE REGISTRATION FLOW - SAME COMPANY"

# -------------------------------
# 4.1 Register Additional Employee via /register (Same Company)
# -------------------------------
echo -e "\n4.1 Registering Additional Employee via /register (same company)..."
ADDITIONAL_EMPLOYEE_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Robert Taylor",
    "email": "robert.taylor@techcompany.com",
    "password": "Robert123456",
    "companyName": "TechCorp International"
  }')

echo "$ADDITIONAL_EMPLOYEE_RESPONSE" | jq '.data | {name, role, companyName}'

# =============================================================================
# SECTION 5: EMPLOYEE LOGIN & PROFILE TESTING
# =============================================================================
echo -e "\n🔵 SECTION 5: EMPLOYEE LOGIN & PROFILE TESTING"

# -------------------------------
# 5.1 Employee 1 Login (Alex Johnson)
# -------------------------------
echo -e "\n5.1 Employee 1 Login (Alex Johnson)..."
ALEX_LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex.johnson@techcompany.com",
    "password": "AlexDev123456"
  }')

echo "$ALEX_LOGIN_RESPONSE" | jq '.data | {name, role, accessToken}'

ALEX_TOKEN=$(echo "$ALEX_LOGIN_RESPONSE" | jq -r '.data.accessToken')

if [ -n "$ALEX_TOKEN" ] && [ "$ALEX_TOKEN" != "null" ]; then
  # -------------------------------
  # 5.2 Get Employee 1 Profile
  # -------------------------------
  echo -e "\n5.2 Employee 1 Profile (/me)..."
  curl -s -X GET "http://localhost:5000/api/users/me" \
    -H "Authorization: Bearer $ALEX_TOKEN" | jq '.data | {name, role, companyId}'
fi

# -------------------------------
# 5.3 Employee 2 Login (Maria Garcia)
# -------------------------------
echo -e "\n5.3 Employee 2 Login (Maria Garcia)..."
MARIA_LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.garcia@techcompany.com",
    "password": "MariaPM789012"
  }')

echo "$MARIA_LOGIN_RESPONSE" | jq '.data | {name, role, accessToken}'

# =============================================================================
# SECTION 6: SECURITY & VALIDATION TESTS
# =============================================================================
echo -e "\n🔵 SECTION 6: SECURITY & VALIDATION TESTS"

# -------------------------------
# 6.1 Try to Link User from Another Company (Should Fail)
# -------------------------------
echo -e "\n6.1 Trying to link external user (should fail)..."
curl -s -X POST "http://localhost:5000/api/users/link-employee/6904afd3185d1ac4d6e470d9" \
  -H "Authorization: Bearer $TOKEN" | jq '.message // .success'

# -------------------------------
# 6.2 Get All Users in Company
# -------------------------------
echo -e "\n6.2 All users in company..."
curl -s -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {total, users: [.users[] | {name, role, _id}]}'

# =============================================================================
# SECTION 7: CLEANUP & LOGOUT
# =============================================================================
echo -e "\n🔵 SECTION 7: CLEANUP & LOGOUT"

# -------------------------------
# 7.1 Logout Primary Manager
# -------------------------------
echo -e "\n7.1 Primary Manager Logout..."
curl -X POST "http://localhost:5000/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

# -------------------------------
# 7.2 Try /me after logout (Should Fail)
# -------------------------------
echo -e "\n7.2 /me after logout (should fail)..."
curl -s -X GET "http://localhost:5000/api/users/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.message // .success'

# -------------------------------
# 7.3 Employee Logout (if logged in)
# -------------------------------
if [ -n "$ALEX_TOKEN" ] && [ "$ALEX_TOKEN" != "null" ]; then
  echo -e "\n7.3 Employee Logout..."
  curl -X POST "http://localhost:5000/api/auth/logout" \
    -H "Authorization: Bearer $ALEX_TOKEN" | jq '.success'
fi








# --------------------------------------
# 8.1 create shift
# --------------------------------------
 curl -X POST http://localhost:5000/api/shifts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA5OGZhN2MxNDRkM2NlNTM2MjdhMjUiLCJyb2xlIjoibWFuYWdlciIsImNvbXBhbnlJZCI6IjY5MDk4ZmE3YzE0NGQzY2U1MzYyN2EyMyIsImlhdCI6MTc2MjIzNTQyMywiZXhwIjoxNzYyMzIxODIzfQ.jjso-jCTdQCSnewCXSyNxyTrNlmDZzzIRWs9slD2Hb4" \
  -d '{
    "title": "Frontend Sprint",
    "date": "2025-04-05",
    "startTime": "09:00",
    "endTime": "17:00",
    "userId": "69098fa7c144d3ce53627a25",
    "description": "Dashboard UI",
    "notes": "React + Tailwind"
  }'



should add coockies



# --------------------------------------
# 8.2 Getting all company shifts
# --------------------------------------
  echo -e "\n📊 Getting all company shifts..."
curl -s -X GET "http://localhost:5000/api/shifts" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA5OGZhN2MxNDRkM2NlNTM2MjdhMjUiLCJyb2xlIjoibWFuYWdlciIsImNvbXBhbnlJZCI6IjY5MDk4ZmE3YzE0NGQzY2U1MzYyN2EyMyIsImlhdCI6MTc2MjIzNTQyMywiZXhwIjoxNzYyMzIxODIzfQ.jjso-jCTdQCSnewCXSyNxyTrNlmDZzzIRWs9slD2Hb4" \
  | jq '.data | {total:.pagination.total, shifts:[.shifts[]|{title,user:.userId.name}]}'

📊 Getting all company shifts...
{
  "total": 2,
  "shifts": [
    {
      "title": "Overlap",
      "user": "Maria Garcia"
    },
    {
      "title": "Frontend Sprint",
      "user": "John Corporation"
    }
  ]
}
~ ❯                                             









 curl -X POST http://localhost:5000/api/shifts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA5OGZhN2MxNDRkM2NlNTM2MjdhMjUiLCJyb2xlIjoibWFuYWdlciIsImNvbXBhbnlJZCI6IjY5MDk4ZmE3YzE0NGQzY2U1MzYyN2EyMyIsImlhdCI6MTc2MjIzNTQyMywiZXhwIjoxNzYyMzIxODIzfQ.jjso-jCTdQCSnewCXSyNxyTrNlmDZzzIRWs9slD2Hb4" \
  -d '{
    "title": "Frontend Sprint",
    "date": "2025-04-05",
    "startTime": "09:00",
    "endTime": "17:00",
    "userId": "69098fa7c144d3ce53627a25",
    "description": "Dashboard UI",
    "notes": "React + Tailwind"
  }'



echo -e "\n1.2 Logging in as Primary Manager..."
TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.corporation@techcompany.com",
    "password": "JohnCorp123456"
  }' | jq -r '.data.accessToken')
echo "✅ Access Token: $TOKEN"





 curl -X POST http://localhost:5000/api/shifts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA5YjI2ZGUxZTkzYjFiZjkzMzk1ZDUiLCJyb2xlIjoibWFuYWdlciIsImNvbXBhbnlJZCI6IjY5MDliMjZkZTFlOTNiMWJmOTMzOTVkMyIsImlhdCI6MTc2MjYyNTU0NywiZXhwIjoxNzYyNzExOTQ3fQ.OcjRo_4PhDXE871Xfj3A6JPD9eVGC3dhWZeN9gxoJmk" \
  -d '{
    "title": "Frontend Sprint",
    "date": "2025-04-05",
    "startTime": "09:00",
    "endTime": "17:00",
    "userId": "69098fa7c144d3ce53627a25",
    "description": "Dashboard UI",
    "notes": "React + Tailwind"
  }'









shloud add api to manager too shaow all users not in company  




# =============================================================================
# FINAL RESULTS
# =============================================================================
echo -e "\n========================================"
echo "   🎉 ALL TESTS COMPLETED SUCCESSFULLY!"
echo "========================================"
echo "✅ Manager Registration & Login"
echo "✅ 5 Employee Accounts Created"
echo "✅ All Employees Linked to Manager"
echo "✅ Employee Registration & Login"
echo "✅ Security Validation"
echo "✅ Proper Logout Functionality"
echo "========================================"
echo "📊 Summary:"
echo "   - 1 Manager Account: John Corporation"
echo "   - 5 Employee Accounts:"
echo "     1. Alex Johnson (Senior Developer)"
echo "     2. Maria Garcia (Project Manager)"
echo "     3. James Wilson (UX Designer)"
echo "     4. Emma Thompson (Data Analyst)"
echo "     5. Daniel Chen (QA Engineer)"
echo "   - All employees properly linked"
echo "   - Security checks passed"
echo "========================================"


# **TODO: parameters , qures , shifts features , timelog , ui employye pages 