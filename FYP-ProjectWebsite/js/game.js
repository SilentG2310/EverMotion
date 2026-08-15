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
    loadCommunityFeedback();
    initialiseGuardians();
    initialiseGameIntro();
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

                const active = button === tab;

                button.classList.toggle("active", active);

                button.setAttribute(
                    "aria-selected",
                    active ? "true" : "false"
                );

            });

            communityPanels.forEach(panel => {

                const active =
                    panel.id === `tab-${selectedTab}`;

                panel.classList.toggle("active", active);

                panel.hidden = !active;

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

/* =========================================================
   LIVE COMMUNITY FEEDBACK
========================================================= */

const FEEDBACK_API =
    "https://script.google.com/macros/s/AKfycby8lcHCq1FM20J7PZQ7zHC9ojNNaSGy222iN_TGv6eHzRN_veVInKm_nxdkQVZhcXe8/exec";

console.log("loadCommunityFeedback called");

async function loadCommunityFeedback() {

    const container = document.getElementById("feedback-feed");

    if (!container) return;

    try {

        console.log("Fetching feedback...");

        const response = await fetch(FEEDBACK_API);

        console.log("Status:", response.status);

        const text = await response.text();

        console.log("Raw response:", text);

        const feedback = JSON.parse(text);

        console.log("Parsed:", feedback);

        container.innerHTML = "";

        feedback.reverse().forEach(item => {
            console.log(container.innerHTML);

            const stars =
                "★".repeat(Number(item.rating)) +
                "☆".repeat(5 - Number(item.rating));

            container.innerHTML += `
                <article class="announcement-card">

                    <span class="announcement-badge">
                        Community Feedback
                    </span>

                    <p>"${item.feedback}"</p>

                    <span class="announcement-date">
                        ${stars} • ${item.name}
                    </span>

                </article>
            `;

        });

    }

    catch (error) {

        console.error("ERROR:", error);

        container.innerHTML = `
            <article class="announcement-card">

                <span class="announcement-badge">
                    Error
                </span>

                <h3>${error.message}</h3>

            </article>
        `;

    }

}

/* =========================================================
   GUARDIANS
========================================================= */

const guardians = [

{

    name: "AEGIS",

    role: "Lead Rehabilitation Guardian",

    story:
        "Aegis guides every player through difficult rehabilitation challenges. His adaptive AI analyses movement and tailors every mission to each patient's progress, reminding players that consistency is stronger than perfection.",

    quote:
        'One movement today becomes strength tomorrow.',

    image:
        "assets/aegis.png"

},

{

    name: "LYRA",

    role: "Adaptive Therapy Companion",

    story:
        "Lyra brings warmth and optimism to every rehabilitation session. She celebrates every milestone, encouraging patients to rediscover confidence while restoring the fading Lumina Core.",

    quote:
        'Every journey begins with believing you can.',

    image:
        "assets/lyra.png"

}

];



let currentGuardian = 0;
let isChanging = false;

function initialiseGuardians() {

    const guardianCard = document.querySelector(".guardian-card");

    const guardianImage = document.getElementById("guardian-image");
    const guardianName = document.getElementById("guardian-name");
    const guardianRole = document.getElementById("guardian-role");
    const guardianStory = document.getElementById("guardian-story");
    const guardianQuote = document.getElementById("guardian-quote");

    function showGuardian(index){

        const guardian = guardians[index];

        guardianImage.src = guardian.image;
        guardianName.textContent = guardian.name;
        guardianRole.textContent = guardian.role;
        guardianStory.textContent = guardian.story;
        guardianQuote.textContent = guardian.quote;

    }

    function changeGuardian(index){

        if(isChanging) return;

        isChanging = true;

        guardianCard.classList.add("changing");

        setTimeout(()=>{

            showGuardian(index);

            guardianCard.classList.remove("changing");

            isChanging = false;

        },250);

    }

    document.getElementById("guardian-next").addEventListener("click",()=>{

        currentGuardian =
            (currentGuardian + 1) % guardians.length;

        changeGuardian(currentGuardian);

    });
    document.getElementById("guardian-next").addEventListener("click", () => {

    console.log("Next clicked");

});

    document.getElementById("guardian-prev").addEventListener("click",()=>{

        currentGuardian--;

        if(currentGuardian < 0){

            currentGuardian = guardians.length-1;

        }

        changeGuardian(currentGuardian);

    });

    showGuardian(0);

}


/* =========================================================
   STORY ANIMATION
========================================================= */

const storySection =
    document.querySelector(".reveal-story");

const storyObserver =
    new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add("active");

            }

        });

    },{

        threshold:0.3

    });

storyObserver.observe(storySection);




const announcements = [

{

    type:"Latest Update",

    title:"Version 0.4 Preview",

    description:
        "Experience new rehabilitation missions, smoother gesture tracking and a completely redesigned system.",

    date:"August 2026",

    image:"assets/update1.png"

},

{

    type:"Development",

    title:"Robot Expansion",

    description:
        "Meet Aegis and Lyra as they guide patients through the restoration journey.",

    date:"Coming Soon",

    image:"assets/update2.png"

},

{

    type:"Upcoming",

    title:"Story Chapter Two",

    description:
        "Continue restoring the City through new therapy missions and adaptive challenges.",

    date:"Future Update",

    image:"assets/update3.png"

}

];



/* =========================================================
   GAME START INTRO
========================================================= */

function initialiseGameIntro(){

    const intro =
        document.getElementById("game-intro");

    const startButton =
        document.getElementById("start-game");

    const video =
        document.getElementById("intro-video");

    if(!intro || !startButton) return;


    /* Make sure video attempts to play */

    if(video){

        video.play().catch(()=>{

            console.log(
                "Intro video requires user interaction."
            );

        });

    }


    /* START GAME */

    startButton.addEventListener("click",()=>{

        intro.classList.add("intro-hidden");

        document.body.classList.remove("intro-active");

        /* Stop video after transition */

        setTimeout(()=>{

            if(video){

                video.pause();

            }

            intro.remove();

        },1000);

    });

}


let currentAnnouncement = 0;
let isAnnouncementChanging = false;


/* =========================================================
   SHOW ANNOUNCEMENT
========================================================= */

function showAnnouncement(index){

    const item = announcements[index];

    document.getElementById("announcement-image").src =
        item.image;

    document.getElementById("announcement-type").textContent =
        item.type;

    document.getElementById("announcement-title").textContent =
        item.title;

    document.getElementById("announcement-description").textContent =
        item.description;

    document.getElementById("announcement-date").textContent =
        item.date;

}


/* =========================================================
   CHANGE ANNOUNCEMENT
========================================================= */

function changeAnnouncement(index){

    if(isAnnouncementChanging) return;

    isAnnouncementChanging = true;

    const slide =
        document.querySelector(".announcement-slide");

    if(!slide){

        showAnnouncement(index);

        isAnnouncementChanging = false;

        return;

    }

    slide.classList.add("changing");

    setTimeout(()=>{

        showAnnouncement(index);

        slide.classList.remove("changing");

        isAnnouncementChanging = false;

    },250);

}


/* =========================================================
   NEXT ANNOUNCEMENT
========================================================= */

document.getElementById("announcement-next")
.addEventListener("click",()=>{

    currentAnnouncement++;

    if(currentAnnouncement >= announcements.length){

        currentAnnouncement = 0;

    }

    changeAnnouncement(currentAnnouncement);

});


/* =========================================================
   PREVIOUS ANNOUNCEMENT
========================================================= */

document.getElementById("announcement-prev")
.addEventListener("click",()=>{

    currentAnnouncement--;

    if(currentAnnouncement < 0){

        currentAnnouncement =
            announcements.length - 1;

    }

    changeAnnouncement(currentAnnouncement);

});


/* =========================================================
   INITIAL LOAD
========================================================= */

showAnnouncement(0);