/* =========================================================
   EDUTRUST PARENT DIRECTORY
   Principal Dashboard
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       GET AUTH TOKEN
    ===================================================== */

    function getToken() {

        return localStorage.getItem("token") || "";

    }


    /* =====================================================
       ESCAPE HTML
       Prevents database text from being inserted as HTML.
    ===================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       GET FULL PARENT NAME
    ===================================================== */

    function getParentName(parent) {

        const first =
            parent.first_name || "";

        const other =
            parent.other_name || "";

        const last =
            parent.last_name || "";

        return [first, other, last]
            .filter(Boolean)
            .join(" ")
            .trim() || "Unnamed Parent";

    }


    /* =====================================================
       GET STUDENT COUNT
    ===================================================== */

    function getStudentCount(parent) {

        if (
            Array.isArray(parent.students)
        ) {

            return parent.students.length;

        }

        if (
            Array.isArray(parent.children)
        ) {

            return parent.children.length;

        }

        if (
            Array.isArray(parent.student_ids)
        ) {

            return parent.student_ids.length;

        }

        return 0;

    }


    /* =====================================================
       GET PARENT STATUS
    ===================================================== */

    function getParentStatus(parent) {

        return (
            parent.status ||
            parent.account_status ||
            "Active"
        );

    }


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    function getStatusClass(status) {

        const normalized =
            String(status)
                .toLowerCase();

        if (
            normalized === "active"
        ) {

            return "paid";

        }

        if (
            normalized === "pending"
        ) {

            return "pending";

        }

        if (
            normalized === "suspended"
        ) {

            return "unpaid";

        }

        return "pending";

    }


    /* =====================================================
       LOAD PARENTS FROM BACKEND
    ===================================================== */

    async function fetchParents() {

        const token =
            getToken();


        if (!token) {

            window.location.href =
                "login.html";

            return [];

        }


        const response =
            await fetch(
                "/api/parents",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        /*
        ================================================
        SESSION EXPIRED
        ================================================
        */

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "login.html";

            return [];

        }


        /*
        ================================================
        CHECK RESPONSE TYPE
        ================================================
        */

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        if (
            !contentType.includes(
                "application/json"
            )
        ) {

            const text =
                await response.text();

            console.error(
                "Parent API returned non-JSON:",
                text
            );

            throw new Error(
                "The parent server returned an unexpected response."
            );

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load parents."
            );

        }


        /*
        ================================================
        SUPPORT DIFFERENT RESPONSE SHAPES
        ================================================
        */

        if (
            Array.isArray(data.parents)
        ) {

            return data.parents;

        }


        if (
            data.data &&
            Array.isArray(data.data)
        ) {

            return data.data;

        }


        if (
            data.data &&
            Array.isArray(data.data.parents)
        ) {

            return data.data.parents;

        }


        return [];

    }


    /* =====================================================
       RENDER PARENT DIRECTORY
    ===================================================== */

    function renderParentDirectory(
        parents
    ) {

        const contentArea =
            document.getElementById(
                "contentArea"
            );


        if (!contentArea) {

            console.error(
                "contentArea was not found."
            );

            return;

        }


        /*
        ================================================
        CALCULATE COUNTS
        ================================================
        */

        const totalParents =
            parents.length;


        const activeParents =
            parents.filter(
                parent =>
                    getParentStatus(parent)
                        .toLowerCase() ===
                    "active"
            ).length;


        const pendingParents =
            parents.filter(
                parent =>
                    getParentStatus(parent)
                        .toLowerCase() ===
                    "pending"
            ).length;


        const linkedStudents =
            parents.reduce(
                (
                    total,
                    parent
                ) => {

                    return total +
                        getStudentCount(parent);

                },
                0
            );


        /*
        ================================================
        PAGE
        ================================================
        */

        contentArea.innerHTML = `

            <div class="page-content">

                <!-- PAGE HEADER -->

                <div class="page-introduction">

                    <div>

                        <h2>
                            Parents & Guardians
                        </h2>

                        <p>
                            Manage parents and guardians
                            connected to students.
                        </p>

                    </div>


                    <button
                        class="primary-button"
                        id="openParentRegistrationButton"
                    >
                        + Add Parent
                    </button>

                </div>


                <!-- STATISTICS -->

                <div class="stats-grid">

                    <div class="stat-card">

                        <p>
                            Total Parents
                        </p>

                        <h3>
                            ${totalParents}
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
                            ${activeParents}
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
                            ${linkedStudents}
                        </h3>

                        <small>
                            Connected to parents
                        </small>

                    </div>


                    <div class="stat-card">

                        <p>
                            Pending
                        </p>

                        <h3>
                            ${pendingParents}
                        </h3>

                        <small>
                            Awaiting activation
                        </small>

                    </div>

                </div>


                <!-- DIRECTORY -->

                <div class="dashboard-card">

                    <div class="card-header">

                        <div>

                            <h3>
                                Parents Directory
                            </h3>

                            <p>
                                View and manage registered
                                parents and guardians.
                            </p>

                        </div>

                    </div>


                    <!-- SEARCH -->

                    <div
                        class="form-row"
                        style="margin-bottom:20px;"
                    >

                        <div class="form-group">

                            <input
                                type="text"
                                id="parentSearchInput"
                                placeholder="🔍 Search parent, phone or email"
                            >

                        </div>

                    </div>


                    <!-- TABLE -->

                    <div class="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Parent / Guardian
                                    </th>

                                    <th>
                                        Relationship
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
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody
                                id="parentsTableBody"
                            >

                                ${renderParentRows(parents)}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        `;

// Attach Event Delegation for Parent View Buttons
const tbody = document.getElementById("parentsTableBody");
if (tbody) {
    tbody.addEventListener("click", function (event) {
        const viewBtn = event.target.closest(".parent-view-button");
        if (viewBtn) {
            const parentId = viewBtn.getAttribute("data-parent-id");
            if (parentId) {
                // Navigate to parent detail view
                window.location.href = `parent-details.html?id=${encodeURIComponent(parentId)}`;
            }
        }
    });
}
        /*
        ================================================
        SEARCH
        ================================================
        */

        const searchInput =
            document.getElementById(
                "parentSearchInput"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function () {

                    const search =
                        this.value
                            .trim()
                            .toLowerCase();


                    const filtered =
                        parents.filter(
                            parent => {

                                const name =
                                    getParentName(
                                        parent
                                    ).toLowerCase();


                                const phone =
                                    (
                                        parent.phone ||
                                        ""
                                    ).toLowerCase();


                                const email =
                                    (
                                        parent.email ||
                                        ""
                                    ).toLowerCase();


                                return (
                                    name.includes(search) ||
                                    phone.includes(search) ||
                                    email.includes(search)
                                );

                            }
                        );


                    const tbody =
                        document.getElementById(
                            "parentsTableBody"
                        );


                    if (tbody) {

                        tbody.innerHTML =
                            renderParentRows(
                                filtered
                            );

                    }

                }
            );

        }


        /*
        ================================================
        ADD PARENT BUTTON
        ================================================
        */

        const addButton =
            document.getElementById(
                "openParentRegistrationButton"
            );


        if (addButton) {

            addButton.addEventListener(
                "click",
                function () {

                    /*
                    Parent registration page
                    */

                    window.location.href =
                        "parent-register.html";

                }
            );

        }

    }


    /* =====================================================
       RENDER TABLE ROWS
    ===================================================== */

    function renderParentRows(
        parents
    ) {

        if (!parents.length) {

            return `

                <tr>

                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:30px;
                        "
                    >

                        No parents have been
                        registered for this school yet.

                    </td>

                </tr>

            `;

        }


        return parents.map(
            parent => {

                const name =
                    getParentName(parent);


                const relationship =
                    parent.relationship ||
                    "Guardian";


                const phone =
                    parent.phone ||
                    "N/A";


                const email =
                    parent.email ||
                    "N/A";


                const students =
                    getStudentCount(parent);


                const status =
                    getParentStatus(parent);


                const statusClass =
                    getStatusClass(status);


                const parentId =
                    parent._id ||
                    parent.id ||
                    "";


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                        </td>


                        <td>
                            ${escapeHTML(
                                relationship
                            )}
                        </td>


                        <td>
                            ${escapeHTML(phone)}
                        </td>


                        <td>
                            ${escapeHTML(email)}
                        </td>


                        <td>

                            ${
                                students === 1
                                    ? "1 Student"
                                    : `${students} Students`
                            }

                        </td>


                        <td>

                            <span
                                class="status ${statusClass}"
                            >

                                ${escapeHTML(status)}

                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="text-button parent-view-button"
                                data-parent-id="${escapeHTML(parentId)}"
                            >
                                View
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

    }


    /* =====================================================
       MAIN FUNCTION
    ===================================================== */

    async function showParentsFromBackend() {

        const contentArea =
            document.getElementById(
                "contentArea"
            );


        if (!contentArea) {

            return;

        }


        /*
        ================================================
        LOADING STATE
        ================================================
        */

        contentArea.innerHTML = `

            <div class="page-content">

                <div class="page-introduction">

                    <div>

                        <h2>
                            Parents & Guardians
                        </h2>

                        <p>
                            Loading your school's
                            parents...
                        </p>

                    </div>

                </div>


                <div class="dashboard-card">

                    <div style="
                        text-align:center;
                        padding:40px;
                    ">

                        Loading parents...

                    </div>

                </div>

            </div>

        `;


        try {

            const parents =
                await fetchParents();


            renderParentDirectory(
                parents
            );


        } catch (error) {

            console.error(
                "SHOW PARENTS ERROR:",
                error
            );


            contentArea.innerHTML = `

                <div class="page-content">

                    <div class="dashboard-card">

                        <div
                            style="
                                padding:30px;
                                text-align:center;
                            "
                        >

                            <h3>
                                Unable to load parents
                            </h3>

                            <p>
                                ${escapeHTML(
                                    error.message
                                )}
                            </p>


                            <button
                                class="primary-button"
                                id="retryParentsButton"
                                style="margin-top:15px;"
                            >
                                Try Again
                            </button>

                        </div>

                    </div>

                </div>

            `;


            document
                .getElementById(
                    "retryParentsButton"
                )
                ?.addEventListener(
                    "click",
                    showParentsFromBackend
                );

        }

    }


    /* =====================================================
       EXPOSE FUNCTION TO DASHBOARD
    ===================================================== */

    window.showParentsFromBackend =
        showParentsFromBackend;


})();
