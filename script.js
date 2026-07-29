
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

menuButton.addEventListener("click", function () {
    navLinks.classList.toggle("show-menu");
});
/* ===========================
   COUNTER ANIMATION
=========================== */

const counters = document.querySelectorAll(".counter");

const startCounters = () => {

    counters.forEach(counter => {

        const target = Number(counter.dataset.target);

        let count = 0;

        const speed = target / 100;

        const update = () => {

            count += speed;

            if (count < target) {

                counter.innerText = Math.ceil(count).toLocaleString();

                requestAnimationFrame(update);

            } else {

                counter.innerText = target.toLocaleString() + "+";

            }

        };

        update();

    });

};

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            startCounters();

            observer.disconnect();

        }

    });

});

observer.observe(document.querySelector(".stats-section"));
