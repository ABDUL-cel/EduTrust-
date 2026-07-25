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

else {

    showComingSoon(
        item.querySelector("span:last-child").textContent
    );

}


    });


});


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
