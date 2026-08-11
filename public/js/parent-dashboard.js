// ======================================================
// PARENT DASHBOARD
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    loadParentDashboard();
});


// ======================================================
// CONFIG
// ======================================================

const API_BASE = "/api/parents";


// ======================================================
// AUTH TOKEN
// ======================================================

function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("accessToken")
    );
}


// ======================================================
// API REQUEST HELPER
// ======================================================

async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Something went wrong."
        );
    }

    return data;
}


// ======================================================
// LOAD DASHBOARD
// ======================================================

async function loadParentDashboard() {
    try {
        showLoading();

        const data =
            await apiRequest("/dashboard");

        if (!data.success) {
            throw new Error(
                data.message ||
                "Unable to load dashboard."
            );
        }

        const dashboard =
            data.dashboard;

        renderParentInformation(
            dashboard.parent
        );

        renderSchoolInformation(
            dashboard.school
        );

        renderSummary(
            dashboard.summary
        );

        renderChildren(
            dashboard.children
        );

        hideLoading();

    } catch (error) {
        console.error(
            "PARENT DASHBOARD ERROR:",
            error
        );

        hideLoading();

        showError(
            error.message
        );
    }
}


// ======================================================
// PARENT INFORMATION
// ======================================================

function renderParentInformation(parent) {
    if (!parent) {
        return;
    }

    setText(
        "parentName",
        parent.fullName || "Parent"
    );

    setText(
        "parentRelationship",
        parent.relationship || "-"
    );

    setText(
        "parentEmail",
        parent.email || "-"
    );

    setText(
        "parentPhone",
        parent.phone || "-"
    );

    setText(
        "parentAddress",
        parent.homeAddress || "-"
    );

    setText(
        "parentOccupation",
        parent.occupation || "-"
    );

    setText(
        "parentStatus",
        parent.status || "-"
    );

    const passport =
        document.getElementById(
            "parentPassport"
        );

    if (passport) {
        if (parent.passport) {
            passport.src =
                parent.passport;

            passport.style.display =
                "block";
        } else {
            passport.style.display =
                "none";
        }
    }
}


// ======================================================
// SCHOOL INFORMATION
// ======================================================

function renderSchoolInformation(school) {
    if (!school) {
        return;
    }

    setText(
        "schoolName",
        school.name || "School"
    );

    setText(
        "schoolEmail",
        school.email || "-"
    );

    setText(
        "schoolPhone",
        school.phone || "-"
    );

    setText(
        "schoolAddress",
        school.address || "-"
    );

    setText(
        "schoolType",
        school.school_type || "-"
    );

    setText(
        "academicSession",
        school.academic_session || "-"
    );

    setText(
        "currentTerm",
        school.current_term || "-"
    );

    setText(
        "schoolMotto",
        school.motto || ""
    );

    const logo =
        document.getElementById(
            "schoolLogo"
        );

    if (logo && school.logo) {
        logo.src =
            school.logo;
    }
}


// ======================================================
// SUMMARY CARDS
// ======================================================

function renderSummary(summary) {
    if (!summary) {
        return;
    }

    setText(
        "totalChildren",
        summary.totalChildren ?? 0
    );

    setText(
        "activeChildren",
        summary.activeChildren ?? 0
    );

    setText(
        "pendingChildren",
        summary.pendingChildren ?? 0
    );

    setText(
        "suspendedChildren",
        summary.suspendedChildren ?? 0
    );

    setText(
        "graduatedChildren",
        summary.graduatedChildren ?? 0
    );
}


// ======================================================
// CHILDREN
// ======================================================

function renderChildren(children) {
    const container =
        document.getElementById(
            "childrenContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !children ||
        children.length === 0
    ) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No children linked</h3>
                <p>
                    There are currently no students
                    connected to this parent account.
                </p>
            </div>
        `;

        return;
    }

    children.forEach(child => {
        const card =
            createChildCard(child);

        container.appendChild(card);
    });
}


// ======================================================
// CREATE CHILD CARD
// ======================================================

function createChildCard(child) {
    const card =
        document.createElement("div");

    card.className =
        "child-card";

    const statusClass =
        getStatusClass(
            child.status
        );

    const passport =
        child.passport ||
        "/images/default-student.png";

    card.innerHTML = `
        <div class="child-card-header">

            <img
                src="${escapeHtml(passport)}"
                alt="Student passport"
                class="child-passport"
                onerror="this.src='/images/default-student.png'"
            >

            <div class="child-main-info">

                <h3>
                    ${escapeHtml(
                        child.fullName ||
                        "Student"
                    )}
                </h3>

                <span class="status ${statusClass}">
                    ${escapeHtml(
                        child.status ||
                        "Unknown"
                    )}
                </span>

            </div>

        </div>

        <div class="child-details">

            <div>
                <span>Admission Number</span>
                <strong>
                    ${escapeHtml(
                        child.admissionNumber ||
                        "-"
                    )}
                </strong>
            </div>

            <div>
                <span>Class</span>
                <strong>
                    ${escapeHtml(
                        child.className ||
                        "-"
                    )}
                </strong>
            </div>

            <div>
                <span>Arm</span>
                <strong>
                    ${escapeHtml(
                        child.arm ||
                        "-"
                    )}
                </strong>
            </div>

            <div>
                <span>Gender</span>
                <strong>
                    ${escapeHtml(
                        child.gender ||
                        "-"
                    )}
                </strong>
            </div>

        </div>

        <div class="child-card-actions">

            <button
                type="button"
                class="btn-view-child"
                data-id="${child.id}"
            >
                View Child
            </button>

        </div>
    `;

    const button =
        card.querySelector(
            ".btn-view-child"
        );

    button.addEventListener(
        "click",
        () => {
            viewChild(
                child.id
            );
        }
    );

    return card;
}


// ======================================================
// VIEW CHILD
// ======================================================

async function viewChild(studentId) {
    try {
        if (!studentId) {
            return;
        }

        const data =
            await apiRequest(
                `/children/${studentId}`
            );

        if (!data.success) {
            throw new Error(
                data.message ||
                "Unable to load child."
            );
        }

        openChildModal(
            data.child
        );

    } catch (error) {
        console.error(
            "VIEW CHILD ERROR:",
            error
        );

        showError(
            error.message
        );
    }
}


// ======================================================
// CHILD MODAL
// ======================================================

function openChildModal(child) {
    const modal =
        document.getElementById(
            "childModal"
        );

    if (!modal) {
        // If the HTML does not contain
        // a modal yet, redirect to
        // the child page.

        window.location.href =
            `/student.html?id=${encodeURIComponent(
                child._id
            )}`;

        return;
    }

    setText(
        "modalChildName",
        [
            child.first_name,
            child.other_name,
            child.last_name
        ]
            .filter(Boolean)
            .join(" ")
    );

    setText(
        "modalAdmissionNumber",
        child.admission_number || "-"
    );

    setText(
        "modalClass",
        child.class_name || "-"
    );

    setText(
        "modalArm",
        child.arm || "-"
    );

    setText(
        "modalGender",
        child.gender || "-"
    );

    setText(
        "modalStatus",
        child.status || "-"
    );

    setText(
        "modalDateOfBirth",
        formatDate(
            child.date_of_birth
        )
    );

    setText(
        "modalAdmissionDate",
        formatDate(
            child.admission_date
        )
    );

    const passport =
        document.getElementById(
            "modalChildPassport"
        );

    if (passport) {
        passport.src =
            child.passport ||
            "/images/default-student.png";
    }

    modal.classList.add(
        "show"
    );
}


// ======================================================
// CLOSE CHILD MODAL
// ======================================================

function closeChildModal() {
    const modal =
        document.getElementById(
            "childModal"
        );

    if (modal) {
        modal.classList.remove(
            "show"
        );
    }
}


// ======================================================
// LOGOUT
// ======================================================

function logoutParent() {
    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "accessToken"
    );

    sessionStorage.removeItem(
        "token"
    );

    sessionStorage.removeItem(
        "accessToken"
    );

    window.location.href =
        "/parent-login.html";
}


// ======================================================
// STATUS CLASS
// ======================================================

function getStatusClass(status) {
    switch (status) {
        case "Active":
            return "status-active";

        case "Pending":
            return "status-pending";

        case "Suspended":
            return "status-suspended";

        case "Graduated":
            return "status-graduated";

        case "Archived":
            return "status-archived";

        default:
            return "status-default";
    }
}


// ======================================================
// SET TEXT
// ======================================================

function setText(
    elementId,
    value
) {
    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent =
            value ?? "-";
    }
}


// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(date) {
    if (!date) {
        return "-";
    }

    const parsed =
        new Date(date);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "-";
    }

    return parsed.toLocaleDateString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ======================================================
// LOADING
// ======================================================

function showLoading() {
    const loading =
        document.getElementById(
            "dashboardLoading"
        );

    if (loading) {
        loading.style.display =
            "flex";
    }
}


function hideLoading() {
    const loading =
        document.getElementById(
            "dashboardLoading"
        );

    if (loading) {
        loading.style.display =
            "none";
    }
}


// ======================================================
// ERROR
// ======================================================

function showError(message) {
    const errorBox =
        document.getElementById(
            "dashboardError"
        );

    if (errorBox) {
        errorBox.textContent =
            message ||
            "Unable to load dashboard.";

        errorBox.style.display =
            "block";

        return;
    }

    alert(
        message ||
        "Unable to load dashboard."
    );
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {
    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ======================================================
// MODAL CLOSE EVENTS
// ======================================================

document.addEventListener(
    "click",
    (event) => {

        if (
            event.target.matches(
                ".close-child-modal"
            )
        ) {
            closeChildModal();
        }

        if (
            event.target.id ===
            "childModal"
        ) {
            closeChildModal();
        }

    }
);


// ======================================================
// EXPORT FOR INLINE HTML BUTTONS
// ======================================================

window.loadParentDashboard =
    loadParentDashboard;

window.viewChild =
    viewChild;

window.closeChildModal =
    closeChildModal;

window.logoutParent =
    logoutParent;
