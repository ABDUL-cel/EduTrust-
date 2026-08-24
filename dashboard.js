// dashboard.js
// =========================================================
// EDU TRUST - DASHBOARD NAVIGATION
// =========================================================
//
// IMPORTANT:
// - This file owns dashboard/page navigation only.
// - student.js owns student management.
// - Do NOT declare navItems anywhere else in this file.
// - Do NOT render students from this file.
// =========================================================

"use strict";

const navItems = document.querySelectorAll(
    ".nav-item[data-page], .submenu-item[data-page]"
);

const pageTitle = document.getElementById("pageTitle");
const contentArea = document.getElementById("contentArea");

// =========================================================
// SHOW PAGE
// =========================================================

function showStaticPage(pageName) {
    if (!pageName) return;

    const pages =
        document.querySelectorAll(".page-content");

    // Hide all pages
    pages.forEach(page => {
        page.classList.add("hidden");
    });

    // Find requested page
    const target =
        document.getElementById(`${pageName}Page`);

    if (!target) {
        console.warn(
            `Dashboard page not found: ${pageName}Page`
        );
        return;
    }

    // Show requested page
    target.classList.remove("hidden");

    // Remove active state
    navItems.forEach(nav => {
        nav.classList.remove("active");
    });

    // Find active navigation item
    let activeItem = null;

    try {
        activeItem = document.querySelector(
            `[data-page="${CSS.escape(pageName)}"]`
        );
    } catch (error) {
        // Fallback for older browsers
        activeItem = Array.from(navItems).find(
            nav => nav.dataset.page === pageName
        );
    }

    activeItem?.classList.add("active");

    // Update page title
    if (pageTitle) {
        pageTitle.textContent =
            activeItem?.textContent?.trim() ||
            pageName
                .replace(/-/g, " ")
                .replace(
                    /\b\w/g,
                    letter => letter.toUpperCase()
                );
    }

    // =====================================================
    // STUDENTS
    // =====================================================
    //
    // dashboard.js DOES NOT render students.
    //
    // student.js owns:
    // - loading
    // - searching
    // - filtering
    // - registration
    // - approval
    // - rejection
    // - suspension
    // - reinstatement
    // - graduation
    // - archive
    // - deletion
    //
    // We only request a refresh if student.js exposes
    // loadStudents().
    // =====================================================

    if (
        pageName === "students" &&
        typeof window.loadStudents === "function"
    ) {
        window.loadStudents();
    }

    // =====================================================
    // MOBILE SIDEBAR
    // =====================================================

    if (window.innerWidth <= 768) {
        document
            .getElementById("sidebar")
            ?.classList.remove("show");
    }
}

// =========================================================
// NAVIGATION EVENTS
// =========================================================

navItems.forEach(item => {

    item.addEventListener("click", event => {

        event.preventDefault();
        event.stopPropagation();

        const page =
            item.dataset.page;

        if (!page) {
            return;
        }

        showStaticPage(page);
    });

});

// =========================================================
// INITIAL PAGE
// =========================================================

function initializeDashboard() {

    const visiblePage =
        document.querySelector(
            ".page-content:not(.hidden)"
        );

    if (
        visiblePage?.id &&
        visiblePage.id.endsWith("Page")
    ) {

        const pageName =
            visiblePage.id.slice(0, -4);

        showStaticPage(pageName);

    } else {

        showStaticPage("overview");

    }
}

// =========================================================
// DOM READY
// =========================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

} else {

    initializeDashboard();

}
