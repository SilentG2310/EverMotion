/*=========================================================
 EVERMOTION
 game.js
=========================================================*/

"use strict";

/*=========================================================
 DOM REFERENCES
=========================================================*/

const navbar = document.querySelector(".game-nav");

const scrollProgress = document.getElementById("scroll-progress");

const backToTop = document.getElementById("backToTop");

const hero = document.querySelector(".hero");

const cursorGlow = document.querySelector(".cursor-glow");



/*=========================================================
 INITIALIZE

 window.addEventListener("scroll", handleScroll);

function handleScroll() {

    updateNavbar();

    updateProgressBar();

    updateBackToTop();

    revealElements();

}
=========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initialiseNavigation();

    initialiseScrollProgress();

    initialiseBackToTop();
    initialiseMusic();

    initialiseCursorGlow();

    initialiseGallery();

    preloadGallery();

    initialiseLightbox();
    initialiseCommunityTabs();
});

/*=========================================================
 NAVIGATION
=========================================================*/

function initialiseNavigation() {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 60) {

            navbar.classList.add("scrolled");

        }

        else {

            navbar.classList.remove("scrolled");

        }

    });

}

/*=========================================================
 SCROLL PROGRESS BAR
=========================================================*/

function initialiseScrollProgress() {

    window.addEventListener("scroll", () => {

        const scrollTop = document.documentElement.scrollTop;

        const scrollHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;

        const progress = (scrollTop / scrollHeight) * 100;

        scrollProgress.style.width = progress + "%";

    });

}

/*=========================================================
 BACK TO TOP
=========================================================*/

function initialiseBackToTop() {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        }

        else {

            backToTop.classList.remove("show");

        }

    });

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/*=========================================================
 CURSOR GLOW
=========================================================*/

function initialiseCursorGlow() {

    if (!cursorGlow) return;

    document.addEventListener("mousemove", (event) => {

        cursorGlow.style.left = event.clientX + "px";

        cursorGlow.style.top = event.clientY + "px";

    });

}

/* =========================================================
   EVERMOTION MUSIC
========================================================= */

let music;
let musicButton;


/* =========================================================
   INITIALISE MUSIC
========================================================= */

function initialiseMusic() {

    music =
        document.getElementById("backgroundMusic");

    const originalButton =
        document.getElementById("music-toggle");

    if (!music || !originalButton) {
        console.error("Music elements not found.");
        return;
    }

    /*
     * Remove any previous handlers by replacing
     * the button with a clean clone.
     */
    musicButton =
        originalButton.cloneNode(true);

    originalButton.replaceWith(musicButton);

    /*
     * Start silent, then fade in.
     */
    music.volume = 0;

    music.play()
        .then(() => {

            fadeInMusic();

        })
        .catch(() => {

            syncMusicUI();

        });

    /*
     * One click handler.
     */
    musicButton.addEventListener(
        "click",
        toggleMusic
    );

    /*
     * Keep UI synced.
     */
    music.addEventListener(
        "play",
        syncMusicUI
    );

    music.addEventListener(
        "pause",
        syncMusicUI
    );

}


/* =========================================================
   TOGGLE MUSIC
========================================================= */

function toggleMusic(event) {

    event.preventDefault();
    event.stopPropagation();

    /*
     * PLAYING → FADE OUT → PAUSE
     */
    if (!music.paused) {

        fadeOutMusic(() => {

            music.pause();

            syncMusicUI();

        });

        return;
    }


    /*
     * PAUSED → PLAY → FADE IN
     */
    music.volume = 0;

    music.play()
        .then(() => {

            fadeInMusic();

        })
        .catch(() => {

            syncMusicUI();

        });

}


/* =========================================================
   FADE IN
========================================================= */

function fadeInMusic() {

    clearInterval(
        music.fadeTimer
    );

    const targetVolume = 0.35;

    music.volume = 0;

    music.fadeTimer =
        setInterval(() => {

            if (music.volume >= targetVolume) {

                clearInterval(
                    music.fadeTimer
                );

                music.volume =
                    targetVolume;

                syncMusicUI();

                return;
            }

            music.volume =
                Math.min(
                    music.volume + 0.01,
                    targetVolume
                );

        }, 40);

}


/* =========================================================
   FADE OUT
========================================================= */

function fadeOutMusic(callback) {

    clearInterval(
        music.fadeTimer
    );

    music.fadeTimer =
        setInterval(() => {

            if (music.volume <= 0.01) {

                clearInterval(
                    music.fadeTimer
                );

                music.volume = 0;

                if (callback) {
                    callback();
                }

                return;
            }

            music.volume =
                Math.max(
                    music.volume - 0.01,
                    0
                );

        }, 40);

}


/* =========================================================
   SYNCHRONIZE UI
========================================================= */

function syncMusicUI() {

    if (!music || !musicButton) {
        return;
    }

    const playing =
        !music.paused &&
        !music.ended;

    musicButton.classList.toggle(
        "playing",
        playing
    );

    const label =
        musicButton.querySelector(
            ".music-label"
        );

    if (label) {

        label.textContent =
            playing
                ? "Music On"
                : "Music Off";

    }

}
/*=========================================================
 ANIMATED COUNTERS
=========================================================*/

const counters = document.querySelectorAll("[data-counter]");

let countersStarted = false;

function initialiseCounters() {

    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            if (countersStarted) return;

            countersStarted = true;

            animateCounters();

        });

    }, {

        threshold: 0.45

    });

    observer.observe(document.querySelector(".hero"));

}

function animateCounters() {

    counters.forEach(counter => {

        const target = Number(counter.dataset.counter);

        const duration = 1800;

        const start = performance.now();

        function update(time) {

            const progress = Math.min((time - start) / duration, 1);

            const value = Math.floor(progress * target);

            counter.textContent = value.toLocaleString();

            if (progress < 1) {

                requestAnimationFrame(update);

            }

            else {

                counter.textContent = target.toLocaleString();

            }

        }

        requestAnimationFrame(update);

    });

}

/*=========================================================
 REVEAL ON SCROLL
=========================================================*/

const revealElements = document.querySelectorAll(

    ".game-card, .highlight-card, .story-card, .journey-step, .announcement-card"

);

function initialiseRevealAnimations() {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            entry.target.classList.add("revealed");

        });

    }, {

        threshold: 0.18

    });

    revealElements.forEach(element => {

        observer.observe(element);

    });

}

/*=========================================================
 INITIALISE
=========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initialiseCounters();

    initialiseRevealAnimations();

});

/* =========================================================
   EVERMOTION SCREENSHOT CAROUSEL
========================================================= */

const featuredImage =
    document.getElementById("featured-image");

const thumbnails =
    document.querySelectorAll(".thumb");

const carousel =
    document.querySelector(".featured-shot");



let currentImage = 0;

let galleryTimer = null;

let isChangingImage = false;


/* =========================================================
   INITIALISE
========================================================= */

function initialiseGallery() {

    if (
        !featuredImage ||
        thumbnails.length === 0
    ) {
        return;
    }

    /* Thumbnail clicks */
    thumbnails.forEach((thumb, index) => {

        thumb.addEventListener("click", () => {

            showImage(index, true);

        });

    });


    /* MAIN LEFT ARROW */
    if (previousButton) {

        previousButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                previousImage();

                startGallery();

            }
        );

    }


    /* MAIN RIGHT ARROW */
    if (nextButton) {

        nextButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                nextImage();

                startGallery();

            }
        );

    }


    /* FULLSCREEN */
    if (fullscreenButton) {

        fullscreenButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                openLightbox(currentImage);

            }
        );

    }


    /* Start autoplay */
    startGallery();


    /* Pause autoplay when hovering */
    const gallery =
        document.querySelector(
            ".featured-shot"
        );

    if (gallery) {

        gallery.addEventListener(
            "mouseenter",
            stopGallery
        );

        gallery.addEventListener(
            "mouseleave",
            startGallery
        );

    }

}
/* =========================================================
   SHOW IMAGE
========================================================= */

function showImage(
    index,
    userInteraction = false
) {

    if (
        !featuredImage ||
        !thumbnails.length ||
        isChangingImage
    ) {
        return;
    }


    /*
     * Wrap around
     */
    if (index < 0) {

        index =
            thumbnails.length - 1;

    }


    if (
        index >=
        thumbnails.length
    ) {

        index = 0;

    }


    currentImage = index;

    const thumbnail =
        thumbnails[index];


    const newSource =
        thumbnail.dataset.full ||
        thumbnail.src;


    if (
        featuredImage.src.endsWith(
            newSource
        )
    ) {

        updateActiveThumbnail();

        return;

    }


    isChangingImage = true;


    /*
     * Fade out
     */
    featuredImage.classList.add(
        "carousel-fade-out"
    );


    setTimeout(() => {

        featuredImage.src =
            newSource;


        /*
         * Force browser to render the new
         * image before fading back in.
         */
        requestAnimationFrame(() => {

            featuredImage.classList.remove(
                "carousel-fade-out"
            );

            featuredImage.classList.add(
                "carousel-fade-in"
            );


            setTimeout(() => {

                featuredImage.classList.remove(
                    "carousel-fade-in"
                );

                isChangingImage = false;

            }, 450);

        });


        updateActiveThumbnail();


    }, 250);


    /*
     * User manually changed image:
     * restart the 5-second timer.
     */
    if (userInteraction) {

        startGallery();

    }

}


/* =========================================================
   ACTIVE THUMBNAIL
========================================================= */

function updateActiveThumbnail() {

    thumbnails.forEach(
        (thumbnail, index) => {

            thumbnail.classList.toggle(
                "active",
                index === currentImage
            );

        }
    );


}


/* =========================================================
   NEXT / PREVIOUS
========================================================= */

function nextImage() {

    showImage(
        currentImage + 1
    );

}


function previousImage() {

    showImage(
        currentImage - 1
    );

}


/* =========================================================
   AUTOPLAY
========================================================= */

function startGallery() {

    stopGallery();


    galleryTimer =
        setInterval(() => {

            nextImage();

        }, 3000);

}


function stopGallery() {

    if (galleryTimer) {

        clearInterval(
            galleryTimer
        );

        galleryTimer = null;

    }

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        /*
         * Don't hijack arrow keys while typing.
         */
        const target =
            event.target;

        if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA"
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextImage();

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousImage();

        }

    }
);


/* =========================================================
   PRELOAD
========================================================= */

function preloadGallery() {

    thumbnails.forEach(
        (thumbnail) => {

            const image =
                new Image();

            image.src =
                thumbnail.dataset.full ||
                thumbnail.src;

        }
    );

}

/*=========================================================
 LIGHTBOX ENGINE
=========================================================*/

const lightbox =
    document.getElementById("image-lightbox");

const lightboxImage =
    document.getElementById("lightbox-image");

const closeLightbox =
    document.querySelector(".close-lightbox");

const previousButton =
    document.querySelector(".lightbox-prev");

const nextButton =
    document.querySelector(".lightbox-next");
const fullscreenButton =
    document.querySelector(".fullscreen-btn");


function initialiseLightbox() {

    if (!lightbox || !featuredImage) return;

    featuredImage.addEventListener(

        "click",

        () => {

            openLightbox(currentImage);

        }

    );

    thumbnails.forEach((thumb, index) => {

        thumb.addEventListener(

            "dblclick",

            () => {

                openLightbox(index);

            }

        );

    });

    closeLightbox.addEventListener(

        "click",

        closeViewer

    );

    previousButton.addEventListener(

        "click",

        () => {

            navigateLightbox(-1);

        }

    );

    nextButton.addEventListener(

        "click",

        () => {

            navigateLightbox(1);

        }

    );

    lightbox.addEventListener(

        "click",

        (event) => {

            if (event.target === lightbox ||
                event.target.classList.contains("lightbox-overlay")) {

                closeViewer();

            }

        }

    );

}

/*=========================================================
 OPEN
=========================================================*/

function openLightbox(index) {

    currentImage = index;

    lightboxImage.src =
        thumbnails[index].dataset.full ||
        thumbnails[index].src;

    lightbox.classList.add("active");

    document.body.style.overflow = "hidden";

}

/*=========================================================
 CLOSE
=========================================================*/

function closeViewer() {

    lightbox.classList.remove("active");

    document.body.style.overflow = "";

}

/*=========================================================
 LIGHTBOX NAVIGATION
=========================================================*/

function navigateLightbox(direction) {

    currentImage += direction;

    if (currentImage < 0)
        currentImage = thumbnails.length - 1;

    if (currentImage >= thumbnails.length)
        currentImage = 0;

    lightboxImage.classList.add("fade");

    setTimeout(() => {

        lightboxImage.src =
            thumbnails[currentImage].dataset.full ||
            thumbnails[currentImage].src;

        lightboxImage.classList.remove("fade");

    }, 180);

}

/*=========================================================
 KEYBOARD SUPPORT
=========================================================*/

document.addEventListener(

    "keydown",

    (event) => {

        if (!lightbox.classList.contains("active"))
            return;

        switch (event.key) {

            case "Escape":

                closeViewer();

                break;

            case "ArrowRight":

                navigateLightbox(1);

                break;

            case "ArrowLeft":

                navigateLightbox(-1);

                break;

        }

    }

);

/*=========================================================
 TOUCH SUPPORT
=========================================================*/

let touchStartX = 0;

let touchEndX = 0;

lightbox?.addEventListener(

    "touchstart",

    (event) => {

        touchStartX = event.changedTouches[0].clientX;

    }

);

lightbox?.addEventListener(

    "touchend",

    (event) => {

        touchEndX = event.changedTouches[0].clientX;

        const difference = touchEndX - touchStartX;

        if (difference > 80) {

            navigateLightbox(-1);

        }

        else if (difference < -80) {

            navigateLightbox(1);

        }

    }

);

/*=========================================================
 COMMUNITY TABS
=========================================================*/

const communityTabs =
    document.querySelectorAll(".community-tab");

const communityPanels =
    document.querySelectorAll(".community-panel");

function initialiseCommunityTabs() {

    if (!communityTabs.length) return;

    communityTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            const selectedTab = tab.dataset.tab;

            communityTabs.forEach(button => {

                const isActive =
                    button === tab;

                button.classList.toggle(
                    "active",
                    isActive
                );

                button.setAttribute(
                    "aria-selected",
                    isActive ? "true" : "false"
                );

            });

            communityPanels.forEach(panel => {

                const isActive =
                    panel.id === `tab-${selectedTab}`;

                panel.classList.toggle(
                    "active",
                    isActive
                );

                panel.hidden = !isActive;

            });

        });

    });

}

/* =========================================================
   MAIN CAROUSEL ARROW CONTROLS
========================================================= */

document.addEventListener("click", function (event) {

    const previous =
        event.target.closest(".carousel-prev");

    const next =
        event.target.closest(".carousel-next");

    if (previous) {

        event.preventDefault();
        event.stopPropagation();

        previousImage();

        startGallery();

        return;
    }

    if (next) {

        event.preventDefault();
        event.stopPropagation();

        nextImage();

        startGallery();

        return;
    }

});