/* ==========================================================
   cluma.js — moved from Webflow "Before </body>"
   Pure JavaScript only (no <script>, no <link>, no <audio>)
   ========================================================== */

(() => {
  "use strict";

  /* ------------------------------
     RESIZE RELOAD (threshold-based)
     ------------------------------ */
  let resizeTimer;
  let lastWidth = window.innerWidth;
  const threshold = 100;

  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;

    if (Math.abs(currentWidth - lastWidth) > threshold) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        location.reload();
      }, 500);
      lastWidth = currentWidth;
    }
  });

  /* ------------------------------------------------------------
     WEB AUDIO FIX FOR BACKGROUND MUSIC (iOS solves auto-pausing)
     ------------------------------------------------------------ */
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let bgBuffer = null;
  let bgSource = null;
  let bgGain = null;

  async function loadBGMusic() {
    try {
      const url =
        "https://cdn.prod.website-files.com/68f215b71e8776782bb15235/6936a51c370f29b1f599e213_Free%20to%20Speak%20-%20Golden%20Age%20Radio%20(1).mp3";
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      bgBuffer = await audioCtx.decodeAudioData(arr);
    } catch (e) {
      // fail silently
    }
  }

  function playBGMusic(volume = 0.45) {
    if (!bgBuffer) return;

    if (bgSource) {
      try {
        bgSource.stop();
      } catch (e) {}
    }

    bgSource = audioCtx.createBufferSource();
    bgSource.buffer = bgBuffer;
    bgSource.loop = true;

    bgGain = audioCtx.createGain();
    bgGain.gain.value = 0;

    bgSource.connect(bgGain).connect(audioCtx.destination);
    bgSource.start(0);

    bgGain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 2);
  }

  loadBGMusic();

  /* ==========================
   DOM-DEPENDENT CODE START
   ========================== */

const runWhenReady = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
};

runWhenReady(() => {
  /* ------------------------------------------------------------
     HERO INTRO + SCROLL ANIMATIONS (GSAP)
     ------------------------------------------------------------ */
  const hasGSAP = !!window.gsap;
  const hasScrollTrigger = !!window.ScrollTrigger;

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const soundPreloader = document.querySelector(".sound-preloader");
  const muteBtn = document.querySelector("#mute-site");
  const playSound = document.querySelector("#play-sound");
  const preloader = document.querySelector(".preloader");
  const heroGradient = document.querySelector("#hero-gradient-outline");
  const heroContent = document.querySelector("#hero-content");
  const preloaderVid = document.querySelector("[data-preloader-vid]");
  const heroVid = document.querySelector("[data-hero-vid]");

  function lockScroll() {
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100vh";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);
  }

  function unlockScroll() {
    document.body.style.height = "";
    document.body.style.overflow = "";
    document.documentElement.style.height = "";
    document.documentElement.style.overflow = "";
  }

  // ✅ Safety net: if something goes wrong, never trap the user forever
  const failSafeUnlock = () => {
    unlockScroll();
    try {
      if (hasGSAP && hasScrollTrigger) ScrollTrigger.refresh();
    } catch (e) {}
  };

  // If the user leaves the hero without the timeline finishing, still allow scroll
  window.addEventListener("pageshow", failSafeUnlock, { once: true });

  // Only lock scroll if the key elements exist
  const canRunIntro = !!(soundPreloader && muteBtn && playSound && preloader && heroContent);

  function forceStartAtHero() {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    lockScroll();
  }

  if (canRunIntro) {
    forceStartAtHero();
  } else {
    // If we can't run the intro properly, don't ever lock scrolling.
    unlockScroll();
  }

  function setInitialStates() {
    if (!(hasGSAP && hasScrollTrigger)) return;
    if (!soundPreloader || !preloader || !heroGradient || !heroContent) return;

    gsap.set(soundPreloader, {
      opacity: 1,
      scale: 1,
      display: "flex",
      visibility: "visible",
    });

    gsap.set(preloader, {
      opacity: 0,
      scale: 0.85,
      display: "none",
      visibility: "hidden",
    });

    gsap.set(heroGradient, {
      scale: 1.3,
      transformOrigin: "center center",
    });

    gsap.set(heroContent, {
      opacity: 0,
      visibility: "hidden",
      scale: 0.95,
    });

    const animEls = heroContent.querySelectorAll("[data-hero-anim]");
    animEls.forEach((el) => {
      const type = el.getAttribute("data-hero-anim");
      if (type === "left") gsap.set(el, { x: "-60%", opacity: 0, visibility: "hidden" });
      else if (type === "right") gsap.set(el, { x: "60%", opacity: 0, visibility: "hidden" });
      else if (type === "fade") gsap.set(el, { opacity: 0, scale: 0.95, visibility: "hidden" });
    });
  }
  setInitialStates();

  function playVideo(video) {
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  function initHeroScrollAnimation() {
    if (!(hasGSAP && hasScrollTrigger)) return;

    const stickyTrigger = document.querySelector(".hero-sticky-wrp");
    const heroGradientEl = document.querySelector("#hero-gradient-outline");
    const heroWrapper = document.querySelector(".sticky-100vh-content-wrp-hero");

    if (!stickyTrigger || !heroGradientEl || !heroWrapper) return;

    const wrapperEndWidth = "92.75vw";
    const wrapperOffset = 0.06;
    const commonEase = "power2.inOut";

    gsap.set(heroWrapper, { width: "100vw", boxSizing: "border-box" });
    gsap.set(heroGradientEl, { scale: 1.3, transformOrigin: "center center" });

    gsap.timeline({
      scrollTrigger: {
        trigger: stickyTrigger,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      },
    })
      .to(heroGradientEl, { scale: 1, ease: commonEase }, 0)
      .to(heroWrapper, { width: wrapperEndWidth, ease: commonEase }, wrapperOffset);
  }

  function startHeroIntro() {
    // If GSAP isn't available for some reason, don't trap scroll.
    if (!hasGSAP) {
      failSafeUnlock();
      return;
    }

    [muteBtn, playSound].forEach((btn) => btn?.setAttribute("disabled", true));

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    // ✅ Ultimate safety net: if timeline completes OR is interrupted, unlock scroll.
    tl.eventCallback("onComplete", failSafeUnlock);
    tl.eventCallback("onInterrupt", failSafeUnlock);

    tl.to(soundPreloader, {
      scale: 1.15,
      opacity: 0,
      duration: 1.2,
      onComplete: () => {
        soundPreloader.style.display = "none";
      },
    });

    tl.set(preloader, { display: "flex", visibility: "visible" });
    tl.to(preloader, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" });

    tl.add(() => playVideo(preloaderVid));
    tl.to({}, { duration: 12 });

    tl.to(preloader, {
      opacity: 0,
      scale: 0.9,
      duration: 1.4,
      onComplete: () => {
        preloader.style.display = "none";
      },
    });

    tl.set(heroContent, { visibility: "visible" }, "-=0.5");
    tl.to(heroContent, {
      opacity: 1,
      scale: 1,
      duration: 1.6,
      ease: "power2.out",
      onStart: () => playVideo(heroVid),
    });

    tl.add(() => {
      const animEls = heroContent.querySelectorAll("[data-hero-anim]");
      animEls.forEach((el, i) => {
        const type = el.getAttribute("data-hero-anim");
        let fromProps = {};
        if (type === "left") fromProps = { x: "-60%", opacity: 0 };
        else if (type === "right") fromProps = { x: "60%", opacity: 0 };
        else if (type === "fade") fromProps = { opacity: 0, scale: 0.95 };

        gsap.to(el, {
          x: "0%",
          opacity: 1,
          scale: 1,
          visibility: "visible",
          duration: 1.4,
          delay: i * 0.15,
          ease: "power3.out",
          ...fromProps,
        });
      });
    }, "-=0.4");

    // This is still your “real” unlock moment:
    tl.call(() => {
      unlockScroll();
      initHeroScrollAnimation();
    }, null, "+=0.5");

    // ✅ Extra safety net: even if something blocks the timeline, unlock after ~20s.
    setTimeout(failSafeUnlock, 20000);
  }

  // Hook buttons
  [muteBtn, playSound].forEach((btn) => {
    btn?.addEventListener("click", startHeroIntro);
  });
});

    /* ---------------------- GLOBAL SOUND CONTROL SYSTEM ---------------------- */
    const soundMute = document.querySelector("#mute-site");
    const soundPlayBtn = document.querySelector("#play-sound");
    const bgMusicEl = document.querySelector("#load-sound");

    let bgTimer = null;
    const BG_TARGET_VOLUME = 0.35;

    function setInitialSoundState() {
      document.querySelectorAll("video, audio").forEach((el) => {
        el.muted = true;
        el.volume = 1;
      });

      if (bgMusicEl) {
        bgMusicEl.volume = 0;
        bgMusicEl.muted = true;
        bgMusicEl.loop = true;
      }
    }
    setInitialSoundState();

    soundPlayBtn?.addEventListener("click", () => {
      audioCtx.resume();

      if (bgTimer) clearTimeout(bgTimer);

      document.querySelectorAll("video, audio").forEach((el) => {
        if (el !== bgMusicEl) el.muted = false;
      });

      if (bgMusicEl) {
        bgMusicEl.muted = true;
        bgMusicEl.volume = 0;
      }

      bgTimer = setTimeout(() => {
        playBGMusic(BG_TARGET_VOLUME);
      }, 15000);
    });

    soundMute?.addEventListener("click", () => {
      if (bgTimer) clearTimeout(bgTimer);

      document.querySelectorAll("video, audio").forEach((el) => {
        el.muted = true;
      });

      if (bgMusicEl) bgMusicEl.volume = 0;
    });

    /* ------------------------------------------------------------
       PROJECT 2 NEXT/PREV (DOM Ready)
       ------------------------------------------------------------ */
    (() => {
      const nextBtn = document.querySelector("#next-project2");
      const prevBtn = document.querySelector("#prev-project2");
      const errorSound = document.querySelector("#cta-error-sound");

      if (!nextBtn || !prevBtn) return;

      const expendItems = [
        ...document.querySelectorAll(".expend-img-custom-2nd.is-active"),
        ...document.querySelectorAll(".expend-img-custom-2nd._2"),
        ...document.querySelectorAll(".expend-img-custom-2nd._3"),
        ...document.querySelectorAll(".expend-img-custom-2nd._4"),
        ...document.querySelectorAll(".expend-img-custom-2nd._5"),
      ];

      const typeItems = [
        ...document.querySelectorAll(".is-type.is-active-2"),
        ...document.querySelectorAll(".is-type._2-2"),
        ...document.querySelectorAll(".is-type._3-3"),
        ...document.querySelectorAll(".is-type._4-4"),
        ...document.querySelectorAll(".is-type._5-5"),
      ];

      const steps = 5;
      let currentIndex = 0;

      function hideAll() {
        expendItems.forEach((el, i) => {
          if (!window.gsap) return;
          if (i < 2) gsap.set(el, { opacity: 0, display: "block" });
          else gsap.set(el, { opacity: 0, display: "none" });
        });

        typeItems.forEach((el, i) => {
          if (!window.gsap) return;
          if (i < 2) gsap.set(el, { opacity: 0, display: "block" });
          else gsap.set(el, { opacity: 0, display: "none" });
        });
      }

      function showStep(index) {
        if (!window.gsap) return;
        hideAll();

        const expendPair = expendItems.slice(index * 2, index * 2 + 2);
        const typePair = typeItems.slice(index * 2, index * 2 + 2);

        expendPair.forEach((el) => gsap.set(el, { display: "block" }));
        typePair.forEach((el) => gsap.set(el, { display: "block" }));

        gsap.to([...expendPair, ...typePair], {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
          stagger: 0.05,
        });
      }

      function errorFeedback(btn) {
        btn.style.animation = "jiggle 0.5s ease-in-out";
        btn.addEventListener(
          "animationend",
          () => {
            btn.style.animation = "";
          },
          { once: true }
        );

        if (errorSound) {
          errorSound.currentTime = 0;
          errorSound.play().catch(() => {});
        }

        if (navigator.vibrate) navigator.vibrate(200);
      }

      showStep(currentIndex);

      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentIndex < steps - 1) {
          currentIndex++;
          showStep(currentIndex);
        } else {
          errorFeedback(nextBtn);
        }
      });

      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentIndex > 0) {
          currentIndex--;
          showStep(currentIndex);
        } else {
          errorFeedback(prevBtn);
        }
      });
    })();

    /* ------------------------------------------------------------
       STICKY SECTION ANIMATION (GSAP ScrollTrigger)
       ------------------------------------------------------------ */
    function initStickyAnimation(wrapperSelector) {
      if (!(window.gsap && window.ScrollTrigger)) return;

      gsap.registerPlugin(ScrollTrigger);

      const wrapper = document.querySelector(wrapperSelector);
      if (!wrapper) return;

      const stickySection = wrapper.querySelector("section.is-sticky");
      if (!stickySection) return;

      const gradientOutline = stickySection.querySelector(".gradient-outline");

      const firstContent = wrapper.querySelector(".content-scroll.first-content");
      const fadeContent = wrapper.querySelector(".content-scroll.fade-section");
      const vids = wrapper.querySelectorAll("video");

      [firstContent, fadeContent].forEach((content) => {
        if (!content) return;
        const animEls = content.querySelectorAll("[data-anim]");
        animEls.forEach((el) => {
          el.style.opacity = 0;
          el.style.visibility = "hidden";
          const type = el.getAttribute("data-anim");
          if (type === "left") el.style.transform = "translateX(-60%)";
          if (type === "right") el.style.transform = "translateX(60%)";
          if (type === "fade") el.style.transform = "scale(0.95)";
        });
      });

      if (firstContent) {
        firstContent.style.opacity = 1;
        firstContent.style.visibility = "visible";
        firstContent.style.transform = "scale(1)";
      }

      if (fadeContent) {
        fadeContent.style.opacity = 0;
        fadeContent.style.visibility = "hidden";
        fadeContent.style.transform = "scale(0.85)";
      }

      if (gradientOutline) gsap.set(gradientOutline, { scale: 1 });

      const wrapperHeight = wrapper.offsetHeight;
      const pinDistance = Math.max(0, wrapperHeight - window.innerHeight);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: `+=${pinDistance}`,
          scrub: 1.5,
        },
      });

      const firstLeftEls = firstContent?.querySelectorAll("[data-anim='left']");
      const firstRightEls = firstContent?.querySelectorAll("[data-anim='right']");
      const firstFadeEls = firstContent?.querySelectorAll("[data-anim='fade']");

      tl.set(firstLeftEls, { visibility: "" })
        .set(firstRightEls, { visibility: "" })
        .set(firstFadeEls, { visibility: "" })
        .to(firstLeftEls, { x: "0%", autoAlpha: 1, stagger: 0.15, ease: "power3.out" }, 0)
        .to(firstRightEls, { x: "0%", autoAlpha: 1, stagger: 0.15, ease: "power3.out" }, 0)
        .to(firstFadeEls, { scale: 1, autoAlpha: 1, ease: "power3.out" }, 0.2)
        .add(() => {
          if (vids[0]) vids[0].play().catch(() => {});
        }, 0);

      if (gradientOutline) tl.to(gradientOutline, { scale: 1.28, ease: "power2.inOut" }, 0.5);

      tl.to(firstContent, { autoAlpha: 0, scale: 1.25, ease: "power2.inOut" }, 1);

      if (fadeContent) {
        tl.set(fadeContent, { visibility: "" }, 1.5).to(
          fadeContent,
          { autoAlpha: 1, scale: 1, ease: "power2.out" },
          1.5
        );
      }

      const fadeLeftEls = fadeContent?.querySelectorAll("[data-anim='left']");
      const fadeRightEls = fadeContent?.querySelectorAll("[data-anim='right']");
      const fadeFadeEls = fadeContent?.querySelectorAll("[data-anim='fade']");

      tl.set(fadeLeftEls, { visibility: "" })
        .set(fadeRightEls, { visibility: "" })
        .set(fadeFadeEls, { visibility: "" })
        .to(fadeLeftEls, { x: "0%", autoAlpha: 1, stagger: 0.15, ease: "power3.out" }, 2)
        .to(fadeRightEls, { x: "0%", autoAlpha: 1, stagger: 0.15, ease: "power3.out" }, 2)
        .to(fadeFadeEls, { scale: 1, autoAlpha: 1, ease: "power3.out" }, 2)
        .add(() => {
          if (vids[1]) vids[1].play().catch(() => {});
        }, 1.55);

      if (gradientOutline) tl.to(gradientOutline, { scale: 1, ease: "power2.out" }, 3);
    }

    // Keep your original behavior: init sticky on full load (sizes stable)
    window.addEventListener("load", () => {
      initStickyAnimation(".first-sticky-wrp");
      initStickyAnimation(".second-sticky-wrp");
      initStickyAnimation(".third-sticky-wrp");
    });

    /* ------------------------------------------------------------
       SCROLL-PLAY VIDEOS (IntersectionObserver)
       ------------------------------------------------------------ */
    (() => {
      const scrollVideos = document.querySelectorAll("[data-scroll-play]");
      if (!scrollVideos.length) return;

      function createObserver(thresholdValue) {
        return new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const vid = entry.target;
              if (entry.isIntersecting) {
                vid.setAttribute("playsinline", "");
                vid.play().catch(() => {});
              } else {
                vid.pause();
              }
            });
          },
          { threshold: thresholdValue }
        );
      }

      scrollVideos.forEach((vid) => {
        vid.setAttribute("playsinline", "");
        const thresholdValue = vid.offsetHeight > window.innerHeight ? 0.0 : 0.5;
        const observer = createObserver(thresholdValue);
        observer.observe(vid);
      });
    })();

    /* ------------------------------------------------------------
       VIBRATION + CTA SOUND
       ------------------------------------------------------------ */
    (() => {
      function vibrateBasic() {
        navigator.vibrate?.(80);
      }

      function vibrateJiggle() {
        navigator.vibrate?.([50, 80, 50, 80]);
      }

      function playCTASound() {
        const sound = document.getElementById("cta-sound");
        if (!sound) return;
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }

      function handleVibrationAndSound(event) {
        const el = event.currentTarget;

        setTimeout(() => {
          if (el.classList.contains("jiggle")) {
            vibrateJiggle();
            const errorSound = document.getElementById("cta-error-sound");
            if (errorSound) {
              errorSound.currentTime = 0;
              errorSound.play().catch(() => {});
            }
          } else {
            vibrateBasic();
            playCTASound();
          }
        }, 5);
      }

      const ctaSelectors = ".cta, .next, .back, .rewind, .rl_faq6_question, .modules";
      document.querySelectorAll(ctaSelectors).forEach((el) => {
        el.addEventListener("click", handleVibrationAndSound);
      });

      document.querySelectorAll("[sound-spring]").forEach((el) => {
        el.addEventListener("click", () => {
          setTimeout(() => {
            if (!el.classList.contains("jiggle")) {
              const springSound = document.getElementById("cta-spring");
              if (springSound) {
                springSound.currentTime = 0;
                springSound.play().catch(() => {});
              }
            }
          }, 5);
        });
      });

      let clickCount = 0;

      const nextEl = document.querySelector(".next");
      const backEl = document.querySelector(".back");

      if (nextEl) {
        nextEl.addEventListener("click", function () {
          if (clickCount >= 2) {
            nextEl.classList.add("jiggle");
            setTimeout(() => nextEl.classList.remove("jiggle"), 500);
            return;
          }

          clickCount++;
          const rotatingCircle = document.querySelector(".rotating-circle");
          const textLines = document.querySelector(".text-lines._90-2nd");
          const textTrail = document.querySelector(".text-trail");

          const addRotationEffect = (element, midAngle1, midAngle2, finalAngle) => {
            if (!element) return;
            element.style.transition = "transform 0.15s ease";
            element.style.transform = `rotate(${midAngle1}deg)`;
            setTimeout(() => {
              element.style.transition = "transform 0.15s ease";
              element.style.transform = `rotate(${midAngle2}deg)`;
              setTimeout(() => {
                element.style.transition = "transform 0.15s ease";
                element.style.transform = `rotate(${finalAngle}deg)`;
              }, 150);
            }, 150);
          };

          const addTextTrailEffect = (element, midPosition1, midPosition2, finalPosition) => {
            if (!element) return;
            element.style.transition = "transform 0.15s ease";
            element.style.transform = `translateY(${midPosition1 / 16}vw)`;
            setTimeout(() => {
              element.style.transition = "transform 0.15s ease";
              element.style.transform = `translateY(${midPosition2 / 16}vw)`;
              setTimeout(() => {
                element.style.transition = "transform 0.15s ease";
                element.style.transform = `translateY(${finalPosition / 16}vw)`;
              }, 150);
            }, 150);
          };

          if (clickCount === 1) {
            addRotationEffect(rotatingCircle, 75, 68, 70);
            addTextTrailEffect(textTrail, -180, -150, -160);
          } else if (clickCount === 2) {
            addRotationEffect(rotatingCircle, 165, 158, 160);
            addTextTrailEffect(textTrail, -350, -320, -330);
            if (textLines) textLines.style.display = "flex";
          }
        });
      }

      if (backEl) {
        backEl.addEventListener("click", function () {
          if (clickCount === 0) {
            backEl.classList.add("jiggle");
            setTimeout(() => backEl.classList.remove("jiggle"), 500);
            return;
          }

          const rotatingCircle = document.querySelector(".rotating-circle");
          const textLines = document.querySelector(".text-lines._90-2nd");
          const textTrail = document.querySelector(".text-trail");

          const addRotationEffect = (element, midAngle1, midAngle2, finalAngle) => {
            if (!element) return;
            element.style.transition = "transform 0.15s ease";
            element.style.transform = `rotate(${midAngle1}deg)`;
            setTimeout(() => {
              element.style.transition = "transform 0.15s ease";
              element.style.transform = `rotate(${midAngle2}deg)`;
              setTimeout(() => {
                element.style.transition = "transform 0.15s ease";
                element.style.transform = `rotate(${finalAngle}deg)`;
              }, 150);
            }, 150);
          };

          const addTextTrailEffect = (element, midPosition1, midPosition2, finalPosition) => {
            if (!element) return;
            element.style.transition = "transform 0.15s ease";
            element.style.transform = `translateY(${midPosition1 / 16}vw)`;
            setTimeout(() => {
              element.style.transition = "transform 0.15s ease";
              element.style.transform = `translateY(${midPosition2 / 16}vw)`;
              setTimeout(() => {
                element.style.transition = "transform 0.15s ease";
                element.style.transform = `translateY(${finalPosition / 16}vw)`;
              }, 150);
            }, 150);
          };

          if (clickCount === 1) {
            addRotationEffect(rotatingCircle, -25, -18, -20);
            addTextTrailEffect(textTrail, 20, -10, 0);
            if (textLines) textLines.style.display = "none";
            clickCount = 0;
          } else if (clickCount === 2) {
            addRotationEffect(rotatingCircle, 65, 72, 70);
            addTextTrailEffect(textTrail, -150, -180, -160);
            clickCount = 1;
          }
        });
      }
    })();

    /* ------------------------------------------------------------
       YOUR PROJECT SECTION VIDEO (click-to-load)
       (Requires your HTML using <source data-src="...">)
       ------------------------------------------------------------ */
    (() => {
      const video = document.getElementById("video");
      const playBtn = document.getElementById("play");
      const pauseBtn = document.getElementById("pause");
      const rewindBtn = document.getElementById("rewind");
      const forwardBtn = document.getElementById("forward");
      const progressBar = document.getElementById("progress-bar");
      const progressHandle = document.getElementById("progress-handle");

      if (!video || !playBtn || !pauseBtn || !rewindBtn || !forwardBtn || !progressBar || !progressHandle)
        return;

      const HANDLE_MAX_PERCENT = 75;

      function ensureVideoLoaded() {
        const source = video.querySelector("source[data-src]");
        if (!source) return false;

        if (!source.src) {
          source.src = source.dataset.src;
          video.preload = "metadata";
          video.load();
        }
        return true;
      }

      playBtn.addEventListener("click", () => {
        if (!ensureVideoLoaded()) return;
        video.play().catch(() => {});
      });

      pauseBtn.addEventListener("click", () => {
        if (!ensureVideoLoaded()) return;
        video.pause();
      });

      rewindBtn.addEventListener("click", () => {
        if (!ensureVideoLoaded()) return;
        video.currentTime = Math.max(0, video.currentTime - 5);
      });

      forwardBtn.addEventListener("click", () => {
        if (!ensureVideoLoaded()) return;
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
      });

      let targetPercent = 0;
      let currentPercent = 0;

      function animateHandle() {
        if (Math.abs(currentPercent - targetPercent) > 0.001) {
          currentPercent += (targetPercent - currentPercent) * 0.08;
          currentPercent = Math.max(0, Math.min(HANDLE_MAX_PERCENT, currentPercent));
          progressHandle.style.left = currentPercent + "%";
        } else {
          currentPercent = targetPercent;
          progressHandle.style.left = currentPercent + "%";
        }
        requestAnimationFrame(animateHandle);
      }
      requestAnimationFrame(animateHandle);

      video.addEventListener("timeupdate", () => {
        if (!video.duration) return;
        targetPercent = (video.currentTime / video.duration) * HANDLE_MAX_PERCENT;
      });

      let isDragging = false;

      progressHandle.addEventListener("mousedown", () => {
        isDragging = true;
        document.body.style.userSelect = "none";
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const rect = progressBar.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percent = x / rect.width;
        currentPercent = percent * HANDLE_MAX_PERCENT;
        targetPercent = currentPercent;
        progressHandle.style.left = currentPercent + "%";
      });

      document.addEventListener("mouseup", (e) => {
        if (!isDragging) return;
        if (!ensureVideoLoaded()) return;

        isDragging = false;
        document.body.style.userSelect = "";

        const rect = progressBar.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percent = x / rect.width;

        if (video.duration) video.currentTime = percent * video.duration;
      });

      progressBar.addEventListener("click", (e) => {
        if (e.target === progressHandle) return;
        if (!ensureVideoLoaded()) return;

        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;

        if (video.duration) video.currentTime = percent * video.duration;
      });
    })();

    /* ------------------------------------------------------------
       WF LAZYVID HYDRATION (IntersectionObserver)
       ------------------------------------------------------------ */
    (() => {
      const lazyVids = document.querySelectorAll("video.wf-lazyvid");
      if (!lazyVids.length) return;

      function hydrate(video) {
        video.querySelectorAll("source[data-src]").forEach((source) => {
          if (!source.src) source.src = source.dataset.src;
        });
        video.load();
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const vid = entry.target;
            hydrate(vid);

            const tryPlay = () => vid.play().catch(() => {});
            vid.addEventListener("canplay", tryPlay, { once: true });

            io.unobserve(vid);
          });
        },
        { rootMargin: "250px" }
      );

      lazyVids.forEach((v) => io.observe(v));
    });
  });
})();
