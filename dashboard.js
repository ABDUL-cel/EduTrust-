// dashboard.js
// =========================================================
// DASHBOARD NAVIGATION ONLY
// student.js owns student management and backend requests.
// =========================================================

"use strict";

const navItems = document.querySelectorAll(
    ".nav-item[data-page], .submenu-item[data-page]"
);

const pageTitle = document.getElementById("pageTitle");
const contentArea = document.getElementById("contentArea");


/* =========================================================
   SHOW PAGE
========================================================= */

function showStaticPage(pageName) {
    if (!pageName) return;

    const pages = document.querySelectorAll(".page-content");

    pages.forEach(page => {
        page.classList.add("hidden");
    });

    const target = document.getElementById(
        `${pageName}Page`
    );

    if (!target) {
        console.warn(
            `Dashboard page not found: ${pageName}Page`
        );
        return;
    }

    target.classList.remove("hidden");


    /* -----------------------------------------------------
       ACTIVE SIDEBAR ITEM
    ----------------------------------------------------- */

    navItems.forEach(nav => {
        nav.classList.remove("active");
    });

    const activeItem = document.querySelector(
        `[data-page="${CSS.escape(pageName)}"]`
    );

    activeItem?.classList.add("active");


    /* -----------------------------------------------------
       PAGE TITLE
    ----------------------------------------------------- */

    if (pageTitle) {
        pageTitle.textContent =
            activeItem?.textContent?.trim() ||
            pageName
                .replace(/-/g, " ")
                .replace(/\b\w/g, letter =>
                    letter.toUpperCase()
                );
    }


    /* -----------------------------------------------------
       STUDENTS
       
       student.js owns all student/backend operations.
    ----------------------------------------------------- */

    if (pageName === "students") {

        if (typeof window.loadStudents === "function") {

            console.log(
                "Dashboard: asking student.js to load students..."
            );

            window.loadStudents();

        } else {

            console.warn(
                "student.js loadStudents() is not available."
            );

        }
    }


    /* -----------------------------------------------------
       MOBILE SIDEBAR
    ----------------------------------------------------- */

    if (window.innerWidth <= 768) {

        document
            .getElementById("sidebar")
            ?.classList.remove("show");

    }
}


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

navItems.forEach(item => {

    item.addEventListener("click", event => {

        event.preventDefault();
        event.stopPropagation();

        const page = item.dataset.page;

        console.log(
            "Dashboard navigation clicked:",
            page
        );

        if (page) {
            showStaticPage(page);
        }

    });

});


/* =========================================================
   REPORTS / SETTINGS DROPDOWNS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const reportsToggle =
            document.querySelector(".reports-toggle");

        const settingsToggle =
            document.querySelector(".settings-toggle");


        reportsToggle?.addEventListener(
            "click",
            () => {

                const group =
                    reportsToggle.closest(".nav-group");

                group?.classList.toggle("open");

            }
        );


        settingsToggle?.addEventListener(
            "click",
            () => {

                const group =
                    settingsToggle.closest(".nav-group");

                group?.classList.toggle("open");

            }
        );


        /* -------------------------------------------------
           INITIAL PAGE
        ------------------------------------------------- */

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

    }
);
