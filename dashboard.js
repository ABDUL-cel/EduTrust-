"use strict";

/*
=========================================================
 EDU TRUST - DASHBOARD NAVIGATION
=========================================================

 dashboard.js ONLY controls:

 - Sidebar navigation
 - Page switching
 - Active sidebar item
 - Page title
 - Mobile sidebar

 student.js controls:

 - Students
 - Student registration
 - Student loading
 - Search
 - Filters
 - Approve
 - Reject
 - Suspend
 - Reinstate
 - Graduate
 - Archive
 - Delete

 IMPORTANT:
 DO NOT add another navItems declaration anywhere
 in this file.
=========================================================
*/


/* =========================================================
   DOM ELEMENTS
========================================================= */

let navItems = [];
let pageTitle = null;
let sidebar = null;
let menuToggle = null;


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

function initializeDashboard() {

    navItems = document.querySelectorAll(
        ".nav-item[data-page], .submenu-item[data-page]"
    );

    pageTitle =
        document.getElementById("pageTitle");

    sidebar =
        document.getElementById("sidebar") ||
        document.querySelector(".sidebar");

    menuToggle =
        document.getElementById("menu-toggle");


    console.log(
        "EDU TRUST dashboard initialized."
    );

    console.log(
        "Navigation items:",
        navItems.length
    );


    /* =====================================================
       SIDEBAR NAVIGATION
    ===================================================== */

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                const page =
                    item.getAttribute("data-page");

                if (!page) {
                    return;
                }

                console.log(
                    "Dashboard navigation:",
                    page
                );

                showPage(page, item);
            }
        );

    });


    /* =====================================================
       MOBILE / DESKTOP SIDEBAR TOGGLE
    ===================================================== */

    if (menuToggle && sidebar) {

        menuToggle.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                if (
                    window.innerWidth <= 768
                ) {

                    sidebar.classList.toggle(
                        "show"
                    );

                } else {

                    sidebar.classList.toggle(
                        "collapsed"
                    );

                }

            }
        );

    }


    /* =====================================================
       INITIAL PAGE
    ===================================================== */

    let initialPage = null;

    /*
     * Look for an already visible page.
     */

    const visiblePage =
        document.querySelector(
            ".page-content:not(.hidden)"
        );

    if (
        visiblePage &&
        visiblePage.id &&
        visiblePage.id.endsWith("Page")
    ) {

        initialPage =
            visiblePage.id.substring(
                0,
                visiblePage.id.length - 4
            );

    }


    /*
     * If nothing is visible,
     * use overview.
     */

    if (!initialPage) {

        initialPage = "overview";

    }


    /*
     * Find matching navigation button.
     */

    const initialNavItem =
        Array.from(navItems).find(
            item =>
                item.getAttribute("data-page") ===
                initialPage
        );


    /*
     * Show initial page.
     */

    showPage(
        initialPage,
        initialNavItem
    );

}


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(
    pageName,
    clickedNavItem = null
) {

    if (!pageName) {
        return;
    }


    /*
    =======================================================
    FIND ALL STATIC PAGE CONTENT
    =======================================================
    */

    const pages =
        document.querySelectorAll(
            ".page-content"
        );


    /*
    =======================================================
    HIDE ALL PAGES
    =======================================================
    */

    pages.forEach(page => {

        page.classList.add(
            "hidden"
        );

    });


    /*
    =======================================================
    FIND TARGET PAGE
    =======================================================
    */

    const targetPage =
        document.getElementById(
            `${pageName}Page`
        );


    /*
    =======================================================
    PAGE DOES NOT EXIST
    =======================================================
    */

    if (!targetPage) {

        console.warn(
            `Dashboard page not found: ${pageName}Page`
        );

        /*
         * Do not leave the content area completely blank.
         */

        const contentArea =
            document.getElementById(
                "contentArea"
            );

        if (contentArea) {

            contentArea.innerHTML = `
                <div
                    class="page-content"
                    style="
                        display:block;
                        padding:40px;
                    "
                >

                    <h2>
                        ${escapeDashboardText(
                            formatPageName(pageName)
                        )}
                    </h2>

                    <p>
                        This page has not been created yet.
                    </p>

                </div>
            `;

        }

        return;
    }


    /*
    =======================================================
    SHOW TARGET PAGE
    =======================================================
    */

    targetPage.classList.remove(
        "hidden"
    );


    /*
    =======================================================
    ACTIVE NAVIGATION
    =======================================================
    */

    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    /*
    Use clicked item if available.
    Otherwise find it by data-page.
    */

    let activeItem =
        clickedNavItem;


    if (!activeItem) {

        activeItem =
            Array.from(navItems).find(
                item =>
                    item.getAttribute(
                        "data-page"
                    ) === pageName
            );

    }


    if (activeItem) {

        activeItem.classList.add(
            "active"
        );

    }


    /*
    =======================================================
    PAGE TITLE
    =======================================================
    */

    if (pageTitle) {

        let title = "";

        if (activeItem) {

            /*
             * Submenu items contain their text
             * directly inside a span.
             */

            title =
                activeItem.textContent
                    ?.trim() || "";

        }


        if (!title) {

            title =
                formatPageName(
                    pageName
                );

        }


        pageTitle.textContent =
            title;

    }


    /*
    =======================================================
    STUDENTS
    =======================================================

    DO NOT render students here.

    student.js owns the student page.

    We simply tell student.js to load the
    students after the page becomes visible.
    =======================================================
    */

    if (
        pageName === "students"
    ) {

        /*
         * student.js exposes:
         *
         * window.loadStudents
         */

        setTimeout(
            function() {

                if (
                    typeof window.loadStudents ===
                    "function"
                ) {

                    window.loadStudents();

                }

            },
            50
        );

    }


    /*
    =======================================================
    CLOSE MOBILE SIDEBAR
    =======================================================
    */

    if (
        window.innerWidth <= 768 &&
        sidebar
    ) {

        sidebar.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   FORMAT PAGE NAME
========================================================= */

function formatPageName(
    pageName
) {

    return String(pageName || "")
        .replace(
            /-/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


/* =========================================================
   ESCAPE TEXT
========================================================= */

function escapeDashboardText(
    value
) {

    return String(
        value ?? ""
    )
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


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

} else {

    initializeDashboard();

}
