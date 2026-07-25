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
