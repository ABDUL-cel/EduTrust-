// dashboard.js
// =========================================================
// KEEP THIS STUDENT PAGE NAVIGATION.
// DO NOT CREATE/REBUILD A SECOND STUDENT PAGE HERE.
// student.js owns student registration, search, loading,
// approval, rejection, suspension, reinstatement, etc.
// =========================================================

const navItems = document.querySelectorAll(
    ".nav-item[data-page], .submenu-item[data-page]"
);

const pageTitle = document.getElementById("pageTitle");
const contentArea = document.getElementById("contentArea");

function showStaticPage(pageName) {
    if (!pageName) return;

    const pages = document.querySelectorAll(".page-content");

    pages.forEach(page => {
        page.classList.add("hidden");
    });

    const target = document.getElementById(`${pageName}Page`);

    if (!target) {
        console.warn(
            `Dashboard page not found: ${pageName}Page`
        );
        return;
    }

    target.classList.remove("hidden");

    navItems.forEach(nav => {
        nav.classList.remove("active");
    });

    const activeItem = document.querySelector(
        `[data-page="${CSS.escape(pageName)}"]`
    );

    activeItem?.classList.add("active");

    if (pageTitle) {
        pageTitle.textContent =
            activeItem?.textContent?.trim() ||
            pageName
                .replace(/-/g, " ")
                .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    /*
    ========================================================
    STUDENTS

    Do NOT render students here.

    student.js already owns:
      - loading students
      - search
      - filters
      - register
      - approve
      - reject
      - suspend
      - reinstate
      - graduate
      - archive
      - delete

    We only tell student.js to refresh.
    ========================================================
    */

    if (pageName === "students") {
        if (typeof window.loadStudents === "function") {
            window.loadStudents();
        }
    }

    if (window.innerWidth <= 768) {
        document
            .getElementById("sidebar")
            ?.classList.remove("show");
    }
}

navItems.forEach(item => {
    item.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        const page = item.dataset.page;

        if (page) {
            showStaticPage(page);
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const visiblePage =
        document.querySelector(
            ".page-content:not(.hidden)"
        );

    if (
        visiblePage?.id &&
        visiblePage.id.endsWith("Page")
    ) {
        showStaticPage(
            visiblePage.id.slice(0, -4)
        );
    } else {
        showStaticPage("overview");
    }
});// dashboard.js
// =========================================================
// KEEP THIS STUDENT PAGE NAVIGATION.
// DO NOT CREATE/REBUILD A SECOND STUDENT PAGE HERE.
// student.js owns student registration, search, loading,
// approval, rejection, suspension, reinstatement, etc.
// =========================================================

const navItems = document.querySelectorAll(
    ".nav-item[data-page], .submenu-item[data-page]"
);

const pageTitle = document.getElementById("pageTitle");
const contentArea = document.getElementById("contentArea");

function showStaticPage(pageName) {
    if (!pageName) return;

    const pages = document.querySelectorAll(".page-content");

    pages.forEach(page => {
        page.classList.add("hidden");
    });

    const target = document.getElementById(`${pageName}Page`);

    if (!target) {
        console.warn(
            `Dashboard page not found: ${pageName}Page`
        );
        return;
    }

    target.classList.remove("hidden");

    navItems.forEach(nav => {
        nav.classList.remove("active");
    });

    const activeItem = document.querySelector(
        `[data-page="${CSS.escape(pageName)}"]`
    );

    activeItem?.classList.add("active");

    if (pageTitle) {
        pageTitle.textContent =
            activeItem?.textContent?.trim() ||
            pageName
                .replace(/-/g, " ")
                .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    /*
    ========================================================
    STUDENTS

    Do NOT render students here.

    student.js already owns:
      - loading students
      - search
      - filters
      - register
      - approve
      - reject
      - suspend
      - reinstate
      - graduate
      - archive
      - delete

    We only tell student.js to refresh.
    ========================================================
    */

    if (pageName === "students") {
        if (typeof window.loadStudents === "function") {
            window.loadStudents();
        }
    }

    if (window.innerWidth <= 768) {
        document
            .getElementById("sidebar")
            ?.classList.remove("show");
    }
}

navItems.forEach(item => {
    item.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        const page = item.dataset.page;

        if (page) {
            showStaticPage(page);
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const visiblePage =
        document.querySelector(
            ".page-content:not(.hidden)"
        );

    if (
        visiblePage?.id &&
        visiblePage.id.endsWith("Page")
    ) {
        showStaticPage(
            visiblePage.id.slice(0, -4)
        );
    } else {
        showStaticPage("overview");
    }
});
