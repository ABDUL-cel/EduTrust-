const navItems = document.querySelectorAll(".nav-item");

const pageTitle = document.getElementById("pageTitle");

const contentArea = document.getElementById("contentArea");


navItems.forEach(function (item) {


    item.addEventListener("click", function () {


        navItems.forEach(function (nav) {

            nav.classList.remove("active");

        });


        item.classList.add("active");


        const page = item.getAttribute("data-page");


        pageTitle.textContent =
            item.querySelector("span:last-child").textContent;


        if (page === "overview") {

    showOverview();

}

else if (page === "school") {

    showSchoolManagement();

}
    else if (page === "classes") {

    showClasses();

    }
        else if (page === "sessions") {

    showAcademicSessions();

        }
            else if (page === "fees") {

    showSchoolFees();

            }
        else if (page === "fee-structures") {

    showFeeStructures();

        }
            else if (page === "payments") {

    showParentPayments();

            }

                else if (page === "outstanding") {

    showOutstandingFees();

                }
        else if (page === "students") {

    showStudents();

        }

            else if (page === "staff") {

    showStaff();

            }

                else if (page === "parents") {

    showParents();

                }

else {

    showComingSoon(
        item.querySelector("span:last-child").textContent
    );

}
        // Close sidebar on mobile after selecting a page

if (window.innerWidth <= 768) {

    sidebar.classList.remove("active");

}


    });


});

function showParents() {

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        Parents & Guardians
                    </h2>

                    <p>
                        Manage parents and guardians connected to students.
                    </p>

                </div>

                <button class="primary-button">

                    + Add Parent

                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Total Parents
                    </p>

                    <h3>
                        1,020
                    </h3>

                    <small>
                        Registered parents
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Active Accounts
                    </p>

                    <h3>
                        950
                    </h3>

                    <small>
                        Currently active
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Linked Students
                    </p>

                    <h3>
                        1,248
                    </h3>

                    <small>
                        Connected to parents
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Pending Invitations
                    </p>

                    <h3>
                        70
                    </h3>

                    <small>
                        Awaiting account activation
                    </small>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Parents Directory
                        </h3>

                        <p>
                            View and manage registered parents and guardians.
                        </p>

                    </div>

                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Parent / Guardian
                                </th>

                                <th>
                                    Phone
                                </th>

                                <th>
                                    Email
                                </th>

                                <th>
                                    Students
                                </th>

                                <th>
                                    Account Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr>

                                <td>
                                    Amina Yusuf
                                </td>

                                <td>
                                    08012345678
                                </td>

                                <td>
                                    amina@example.com
                                </td>

                                <td>
                                    2 Students
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Ibrahim Musa
                                </td>

                                <td>
                                    08023456789
                                </td>

                                <td>
                                    ibrahim@example.com
                                </td>

                                <td>
                                    1 Student
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Zainab Bello
                                </td>

                                <td>
                                    08034567890
                                </td>

                                <td>
                                    zainab@example.com
                                </td>

                                <td>
                                    1 Student
                                </td>

                                <td>

                                    <span class="status pending">
                                        Pending
                                    </span>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    `;

}

function showStaff() {

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Staff & Teachers
                    </h2>

                    <p>
                        Manage teachers, administrators, and other school staff.
                    </p>

                </div>


                <button class="primary-button">

                    + Add Staff Member

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Total Staff
                    </p>

                    <h3>
                        86
                    </h3>

                    <small>
                        All school staff
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Teachers
                    </p>

                    <h3>
                        62
                    </h3>

                    <small>
                        Teaching staff
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Administrative Staff
                    </p>

                    <h3>
                        14
                    </h3>

                    <small>
                        School administration
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Support Staff
                    </p>

                    <h3>
                        10
                    </h3>

                    <small>
                        Other school staff
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Staff Directory
                        </h3>

                        <p>
                            View and manage all school staff.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Name
                                </th>

                                <th>
                                    Role
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Phone
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            <tr>

                                <td>
                                    Mr. Ibrahim
                                </td>

                                <td>
                                    Teacher
                                </td>

                                <td>
                                    Mathematics
                                </td>

                                <td>
                                    08012345678
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Mrs. Aisha
                                </td>

                                <td>
                                    Teacher
                                </td>

                                <td>
                                    English
                                </td>

                                <td>
                                    08023456789
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Mr. Musa
                                </td>

                                <td>
                                    Accountant
                                </td>

                                <td>
                                    Finance
                                </td>

                                <td>
                                    08034567890
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Mrs. Fatima
                                </td>

                                <td>
                                    Administrator
                                </td>

                                <td>
                                    Administration
                                </td>

                                <td>
                                    08045678901
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                        </tbody>


                    </table>

                </div>

            </div>


        </div>

    `;

}

function showStudents() {

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Students
                    </h2>

                    <p>
                        Manage student records and academic information.
                    </p>

                </div>


                <button class="primary-button">

                    + Add New Student

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Total Students
                    </p>

                    <h3>
                        1,248
                    </h3>

                    <small>
                        All registered students
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Active Students
                    </p>

                    <h3>
                        1,220
                    </h3>

                    <small>
                        Currently enrolled
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        New Students
                    </p>

                    <h3>
                        86
                    </h3>

                    <small>
                        This academic session
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Outstanding Fees
                    </p>

                    <h3>
                        186
                    </h3>

                    <small>
                        Students with balance
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Student Directory
                        </h3>

                        <p>
                            View and manage all registered students.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Student
                                </th>

                                <th>
                                    Student ID
                                </th>

                                <th>
                                    Class
                                </th>

                                <th>
                                    Parent / Guardian
                                </th>

                                <th>
                                    Fee Status
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            <tr>

                                <td>
                                    Fatima Yusuf
                                </td>

                                <td>
                                    EDU-2025-001
                                </td>

                                <td>
                                    Primary 4
                                </td>

                                <td>
                                    Amina Yusuf
                                </td>

                                <td>

                                    <span class="status paid">
                                        Paid
                                    </span>

                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Ahmad Musa
                                </td>

                                <td>
                                    EDU-2025-002
                                </td>

                                <td>
                                    JSS 1
                                </td>

                                <td>
                                    Ibrahim Musa
                                </td>

                                <td>

                                    <span class="status pending">
                                        Partial
                                    </span>

                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Maryam Bello
                                </td>

                                <td>
                                    EDU-2025-003
                                </td>

                                <td>
                                    Primary 5
                                </td>

                                <td>
                                    Zainab Bello
                                </td>

                                <td>

                                    <span class="status pending">
                                        Outstanding
                                    </span>

                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Hassan Abdullahi
                                </td>

                                <td>
                                    EDU-2025-004
                                </td>

                                <td>
                                    SS 2
                                </td>

                                <td>
                                    Yusuf Abdullahi
                                </td>

                                <td>

                                    <span class="status paid">
                                        Paid
                                    </span>

                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                        </tbody>


                    </table>

                </div>

            </div>


        </div>

    `;

}

function showOutstandingFees() {

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        Outstanding Fees
                    </h2>

                    <p>
                        Monitor unpaid and partially paid school fees.
                    </p>

                </div>

                <button class="primary-button">
                    Send Fee Reminder
                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Total Outstanding
                    </p>

                    <h3>
                        ₦2.1M
                    </h3>

                    <small>
                        Awaiting payment
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Students With Balance
                    </p>

                    <h3>
                        186
                    </h3>

                    <small>
                        Require attention
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Partially Paid
                    </p>

                    <h3>
                        74
                    </h3>

                    <small>
                        Incomplete payments
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Payment Rate
                    </p>

                    <h3>
                        80%
                    </h3>

                    <small>
                        Current session
                    </small>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Outstanding Payments
                        </h3>

                        <p>
                            Students with unpaid or incomplete fees.
                        </p>

                    </div>

                    <button class="text-button">
                        Filter
                    </button>

                </div>


                <div class="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Student
                                </th>

                                <th>
                                    Parent / Guardian
                                </th>

                                <th>
                                    Class
                                </th>

                                <th>
                                    Total Fee
                                </th>

                                <th>
                                    Paid
                                </th>

                                <th>
                                    Balance
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr>

                                <td>
                                    Maryam Bello
                                </td>

                                <td>
                                    Zainab Bello
                                </td>

                                <td>
                                    Primary 5
                                </td>

                                <td>
                                    ₦180,000
                                </td>

                                <td>
                                    ₦120,000
                                </td>

                                <td>
                                    ₦60,000
                                </td>

                                <td>

                                    <span class="status pending">
                                        Partial
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Ahmad Musa
                                </td>

                                <td>
                                    Ibrahim Musa
                                </td>

                                <td>
                                    JSS 1
                                </td>

                                <td>
                                    ₦210,000
                                </td>

                                <td>
                                    ₦95,000
                                </td>

                                <td>
                                    ₦115,000
                                </td>

                                <td>

                                    <span class="status pending">
                                        Partial
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Fatima Yusuf
                                </td>

                                <td>
                                    Amina Yusuf
                                </td>

                                <td>
                                    Primary 4
                                </td>

                                <td>
                                    ₦150,000
                                </td>

                                <td>
                                    ₦0
                                </td>

                                <td>
                                    ₦150,000
                                </td>

                                <td>

                                    <span class="status unpaid">
                                        Unpaid
                                    </span>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    `;

}

function showParentPayments() {

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Parent Payments
                    </h2>

                    <p>
                        View and monitor payments made by parents.
                    </p>

                </div>


                <button class="primary-button">

                    Export Payments

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon blue">
                            💳
                        </span>

                    </div>


                    <p>
                        Total Payments
                    </p>


                    <h3>
                        1,062
                    </h3>


                    <small>
                        This academic session
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon green">
                            💰
                        </span>

                    </div>


                    <p>
                        Amount Collected
                    </p>


                    <h3>
                        ₦8.4M
                    </h3>


                    <small>
                        Successfully received
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon orange">
                            ⏳
                        </span>

                    </div>


                    <p>
                        Pending Payments
                    </p>


                    <h3>
                        186
                    </h3>


                    <small>
                        Awaiting payment
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon purple">
                            📈
                        </span>

                    </div>


                    <p>
                        Collection Rate
                    </p>


                    <h3>
                        80%
                    </h3>


                    <small>
                        Current academic session
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">


                    <div>

                        <h3>
                            Payment History
                        </h3>


                        <p>
                            Recent payments made by parents.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Parent
                                </th>

                                <th>
                                    Student
                                </th>

                                <th>
                                    Class
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            <tr>

                                <td>
                                    Amina Yusuf
                                </td>

                                <td>
                                    Fatima Yusuf
                                </td>

                                <td>
                                    Primary 4
                                </td>

                                <td>
                                    ₦150,000
                                </td>

                                <td>
                                    24 Jul 2026
                                </td>

                                <td>

                                    <span class="status paid">
                                        Paid
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Ibrahim Musa
                                </td>

                                <td>
                                    Ahmad Musa
                                </td>

                                <td>
                                    JSS 1
                                </td>

                                <td>
                                    ₦95,000
                                </td>

                                <td>
                                    23 Jul 2026
                                </td>

                                <td>

                                    <span class="status paid">
                                        Paid
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Zainab Bello
                                </td>

                                <td>
                                    Maryam Bello
                                </td>

                                <td>
                                    Primary 5
                                </td>

                                <td>
                                    ₦120,000
                                </td>

                                <td>
                                    22 Jul 2026
                                </td>

                                <td>

                                    <span class="status pending">
                                        Pending
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Yusuf Abdullahi
                                </td>

                                <td>
                                    Hassan Abdullahi
                                </td>

                                <td>
                                    SS 2
                                </td>

                                <td>
                                    ₦200,000
                                </td>

                                <td>
                                    21 Jul 2026
                                </td>

                                <td>

                                    <span class="status paid">
                                        Paid
                                    </span>

                                </td>

                            </tr>


                        </tbody>


                    </table>


                </div>

            </div>


        </div>

    `;

}

function showFeeStructures() {

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        Fee Structures
                    </h2>

                    <p>
                        Create and manage fees for different classes and academic terms.
                    </p>

                </div>

                <button class="primary-button">

                    + Create Fee Structure

                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Active Structures
                    </p>

                    <h3>
                        12
                    </h3>

                    <small>
                        Current academic session
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Primary Section
                    </p>

                    <h3>
                        6
                    </h3>

                    <small>
                        Active fee structures
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Secondary Section
                    </p>

                    <h3>
                        6
                    </h3>

                    <small>
                        Active fee structures
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Academic Session
                    </p>

                    <h3>
                        2025/26
                    </h3>

                    <small>
                        Current session
                    </small>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Active Fee Structures
                        </h3>

                        <p>
                            Fees currently assigned to school classes.
                        </p>

                    </div>

                </div>


                <div class="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Structure Name
                                </th>

                                <th>
                                    Class
                                </th>

                                <th>
                                    Term
                                </th>

                                <th>
                                    Total Amount
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr>

                                <td>
                                    Primary Basic Fees
                                </td>

                                <td>
                                    Primary 1 - 6
                                </td>

                                <td>
                                    First Term
                                </td>

                                <td>
                                    ₦180,000
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Junior Secondary Fees
                                </td>

                                <td>
                                    JSS 1 - 3
                                </td>

                                <td>
                                    First Term
                                </td>

                                <td>
                                    ₦210,000
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Senior Secondary Fees
                                </td>

                                <td>
                                    SS 1 - 3
                                </td>

                                <td>
                                    First Term
                                </td>

                                <td>
                                    ₦230,000
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Fee Breakdown
                        </h3>

                        <p>
                            Example breakdown for Primary 1 - 6.
                        </p>

                    </div>

                </div>


                <div class="school-details">

                    <div class="detail-item">

                        <span>
                            Tuition Fee
                        </span>

                        <strong>
                            ₦150,000
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Examination Fee
                        </span>

                        <strong>
                            ₦10,000
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Development Fee
                        </span>

                        <strong>
                            ₦20,000
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Total
                        </span>

                        <strong>
                            ₦180,000
                        </strong>

                    </div>

                </div>

            </div>

        </div>

    `;

}

function showOverview() {

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        School Overview
                    </h2>

                    <p>
                        Here's what's happening in your school today.
                    </p>

                </div>

                <button class="primary-button">
                    + Add Student
                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Total Students
                    </p>

                    <h3>
                        1,248
                    </h3>

                </div>


                <div class="stat-card">

                    <p>
                        Fees Collected
                    </p>

                    <h3>
                        ₦8.4M
                    </h3>

                </div>


                <div class="stat-card">

                    <p>
                        Outstanding Fees
                    </p>

                    <h3>
                        ₦2.1M
                    </h3>

                </div>


                <div class="stat-card">

                    <p>
                        Active Parents
                    </p>

                    <h3>
                        936
                    </h3>

                </div>

            </div>

        </div>

    `;

}
function showSchoolManagement() {

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        School Management
                    </h2>

                    <p>
                        Manage your school's basic information and details.
                    </p>

                </div>


                <button class="primary-button">

                    Edit School Information

                </button>

            </div>


            <div class="school-management-grid">


                <div class="dashboard-card school-information-card">


                    <div class="card-header">

                        <div>

                            <h3>
                                School Information
                            </h3>

                            <p>
                                Your school's basic information
                            </p>

                        </div>

                    </div>


                    <div class="school-details">


                        <div class="detail-item">

                            <span>
                                School Name
                            </span>

                            <strong>
                                Greenfield School
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                School Email
                            </span>

                            <strong>
                                info@greenfieldschool.com
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Phone Number
                            </span>

                            <strong>
                                +234 801 234 5678
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                School Address
                            </span>

                            <strong>
                                Ilorin, Kwara State, Nigeria
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                School Type
                            </span>

                            <strong>
                                Private School
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Established
                            </span>

                            <strong>
                                2010
                            </strong>

                        </div>


                    </div>


                </div>


                <div class="dashboard-card school-status-card">


                    <div class="card-header">

                        <div>

                            <h3>
                                School Status
                            </h3>

                            <p>
                                Current school account status
                            </p>

                        </div>

                    </div>


                    <div class="status-overview">


                        <div class="large-status-icon">
                            ✓
                        </div>


                        <h3>
                            Active
                        </h3>


                        <p>
                            Your school account is active
                            and fully operational.
                        </p>


                    </div>


                    <div class="status-information">


                        <div>

                            <span>
                                Account Created
                            </span>

                            <strong>
                                July 2026
                            </strong>

                        </div>


                        <div>

                            <span>
                                Current Session
                            </span>

                            <strong>
                                2025/2026
                            </strong>

                        </div>


                    </div>


                </div>


            </div>


        </div>

    `;

}

function showClasses() {

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Classes
                    </h2>

                    <p>
                        Manage your school's classes and class information.
                    </p>

                </div>


                <button class="primary-button">

                    + Add New Class

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Total Classes
                    </p>

                    <h3>
                        24
                    </h3>

                    <small>
                        Across all levels
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Primary Classes
                    </p>

                    <h3>
                        12
                    </h3>

                    <small>
                        Primary section
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Secondary Classes
                    </p>

                    <h3>
                        12
                    </h3>

                    <small>
                        Secondary section
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Total Students
                    </p>

                    <h3>
                        1,248
                    </h3>

                    <small>
                        Assigned to classes
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            All Classes
                        </h3>

                        <p>
                            View and manage all school classes.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Class Name
                                </th>

                                <th>
                                    Section
                                </th>

                                <th>
                                    Students
                                </th>

                                <th>
                                    Class Teacher
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            <tr>

                                <td>
                                    Primary 1A
                                </td>

                                <td>
                                    Primary
                                </td>

                                <td>
                                    42
                                </td>

                                <td>
                                    Mr. Ibrahim
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Primary 2A
                                </td>

                                <td>
                                    Primary
                                </td>

                                <td>
                                    38
                                </td>

                                <td>
                                    Mrs. Aisha
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    JSS 1A
                                </td>

                                <td>
                                    Junior Secondary
                                </td>

                                <td>
                                    45
                                </td>

                                <td>
                                    Mr. Musa
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    SS 2A
                                </td>

                                <td>
                                    Senior Secondary
                                </td>

                                <td>
                                    36
                                </td>

                                <td>
                                    Mrs. Fatima
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                        </tbody>


                    </table>


                </div>


            </div>


        </div>

    `;

}

function showAcademicSessions() {

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Academic Sessions
                    </h2>

                    <p>
                        Manage academic sessions and school terms.
                    </p>

                </div>


                <button class="primary-button">

                    + Create New Session

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Current Session
                    </p>

                    <h3>
                        2025/2026
                    </h3>

                    <small>
                        Active academic session
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Current Term
                    </p>

                    <h3>
                        First Term
                    </h3>

                    <small>
                        Current school term
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Terms Completed
                    </p>

                    <h3>
                        0
                    </h3>

                    <small>
                        This academic session
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Session Status
                    </p>

                    <h3>
                        Active
                    </h3>

                    <small>
                        Currently running
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Current Academic Session
                        </h3>

                        <p>
                            2025/2026 academic year details.
                        </p>

                    </div>


                    <span class="status paid">
                        Active
                    </span>

                </div>


                <div class="school-details">


                    <div class="detail-item">

                        <span>
                            Session Name
                        </span>

                        <strong>
                            2025/2026
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Start Date
                        </span>

                        <strong>
                            September 8, 2025
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Current Term
                        </span>

                        <strong>
                            First Term
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Expected End Date
                        </span>

                        <strong>
                            July 24, 2026
                        </strong>

                    </div>


                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Academic Terms
                        </h3>

                        <p>
                            Manage the terms within this academic session.
                        </p>

                    </div>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Term
                                </th>

                                <th>
                                    Start Date
                                </th>

                                <th>
                                    End Date
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            <tr>

                                <td>
                                    First Term
                                </td>

                                <td>
                                    September 8, 2025
                                </td>

                                <td>
                                    December 19, 2025
                                </td>

                                <td>

                                    <span class="status paid">
                                        Completed
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Second Term
                                </td>

                                <td>
                                    January 12, 2026
                                </td>

                                <td>
                                    April 3, 2026
                                </td>

                                <td>

                                    <span class="status paid">
                                        Completed
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Third Term
                                </td>

                                <td>
                                    April 27, 2026
                                </td>

                                <td>
                                    July 24, 2026
                                </td>

                                <td>

                                    <span class="status pending">
                                        Current
                                    </span>

                                </td>

                            </tr>


                        </tbody>


                    </table>


                </div>


            </div>


        </div>

    `;

}

function showSchoolFees() {

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        School Fee Management
                    </h2>

                    <p>
                        Create, manage, and monitor school fee payments.
                    </p>

                </div>


                <button class="primary-button">

                    + Create Fee Structure

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon blue">
                            💰
                        </span>

                        <span class="stat-change positive">
                            +8.4%
                        </span>

                    </div>


                    <p>
                        Total Expected
                    </p>


                    <h3>
                        ₦10.5M
                    </h3>


                    <small>
                        This academic session
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon green">
                            ✓
                        </span>


                        <span class="stat-change positive">
                            80%
                        </span>

                    </div>


                    <p>
                        Total Collected
                    </p>


                    <h3>
                        ₦8.4M
                    </h3>


                    <small>
                        Successfully paid
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon orange">
                            ⏳
                        </span>


                        <span class="stat-change warning">
                            Attention
                        </span>

                    </div>


                    <p>
                        Outstanding
                    </p>


                    <h3>
                        ₦2.1M
                    </h3>


                    <small>
                        Awaiting payment
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon purple">
                            👨‍🎓
                        </span>


                        <span class="stat-change positive">
                            85%
                        </span>

                    </div>


                    <p>
                        Students Paid
                    </p>


                    <h3>
                        1,062
                    </h3>


                    <small>
                        Out of 1,248 students
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">


                    <div>

                        <h3>
                            Current Fee Structure
                        </h3>


                        <p>
                            2025/2026 academic session
                        </p>

                    </div>


                    <button class="text-button">

                        Manage Fees

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Fee Category
                                </th>

                                <th>
                                    Class Level
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Students
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            <tr>

                                <td>
                                    Tuition Fee
                                </td>

                                <td>
                                    Primary 1 - 6
                                </td>

                                <td>
                                    ₦150,000
                                </td>

                                <td>
                                    520
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Tuition Fee
                                </td>

                                <td>
                                    JSS 1 - 3
                                </td>

                                <td>
                                    ₦180,000
                                </td>

                                <td>
                                    380
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Tuition Fee
                                </td>

                                <td>
                                    SS 1 - 3
                                </td>

                                <td>
                                    ₦200,000
                                </td>

                                <td>
                                    348
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                        </tbody>


                    </table>


                </div>


            </div>


            <div class="dashboard-grid">


                <div class="dashboard-card">


                    <div class="card-header">

                        <div>

                            <h3>
                                Payment Progress
                            </h3>


                            <p>
                                Fee collection progress
                            </p>

                        </div>

                    </div>


                    <div class="collection-progress">


                        <div class="progress-circle">

                            <strong>
                                80%
                            </strong>


                            <span>
                                Collected
                            </span>

                        </div>


                        <div class="progress-details">


                            <div>

                                <span class="progress-dot collected"></span>

                                <span>
                                    Collected
                                </span>

                                <strong>
                                    ₦8.4M
                                </strong>

                            </div>


                            <div>

                                <span class="progress-dot outstanding"></span>

                                <span>
                                    Outstanding
                                </span>

                                <strong>
                                    ₦2.1M
                                </strong>

                            </div>


                        </div>


                    </div>


                </div>


                <div class="dashboard-card">


                    <div class="card-header">

                        <div>

                            <h3>
                                Quick Actions
                            </h3>


                            <p>
                                Common fee management tasks
                            </p>

                        </div>

                    </div>


                    <div class="quick-actions">


                        <button class="quick-action-button">

                            <span>
                                ➕
                            </span>

                            Add Fee Structure

                        </button>


                        <button class="quick-action-button">

                            <span>
                                📄
                            </span>

                            View Payment History

                        </button>


                        <button class="quick-action-button">

                            <span>
                                📢
                            </span>

                            Send Fee Reminder

                        </button>


                    </div>


                </div>


            </div>


        </div>

    `;

        }


function showComingSoon(pageName) {


    contentArea.innerHTML = `

        <div class="empty-page">

            <div class="empty-icon">
                🚧
            </div>

            <h2>
                ${pageName}
            </h2>

            <p>
                This section will be built next.
            </p>

        </div>

    `;

}


const logoutButton =
    document.getElementById("logoutButton");


logoutButton.addEventListener("click", function () {

    window.location.href = "index.html";

});

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const sidebar =
    document.querySelector(".sidebar");


mobileMenuButton.addEventListener("click", function () {

    sidebar.classList.toggle("show");

});
