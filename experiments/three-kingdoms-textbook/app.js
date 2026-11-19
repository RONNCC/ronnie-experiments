"use strict";
// Progressive enhancement only: every chapter and link works without JavaScript.
const sidebar = document.querySelector(".sidebar");
const toggle = document.querySelector("#menu-toggle");
const nav = document.querySelector("#chapter-nav");
const links = [...nav.querySelectorAll("a")];
const chapters = [...document.querySelectorAll(".chapter")];
const bar = document.querySelector(".progress");
sidebar.classList.add("enhanced");
toggle.hidden = false;
function closeMenu() {
  sidebar.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "Chapters +";
}
toggle.addEventListener("click", () => {
  const open = sidebar.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Close −" : "Chapters +";
});
nav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  closeMenu();
  // On mobile, the clicked link is now hidden; move focus to its destination.
  const target = document.querySelector(link.hash);
  if (target) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
});
sidebar.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("open")) {
    closeMenu();
    toggle.focus();
  }
});
let scheduled = false;
let activeId = "";
function updateReadingPosition() {
  scheduled = false;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = `${maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0}%`;
  let current = "";
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= 150) current = chapter.id;
    else break;
  }
  if (current === activeId) return;
  activeId = current;
  for (const link of links) {
    if (link.hash === `#${current}`) {
      link.setAttribute("aria-current", "location");
      // Scroll only the navigation container, never the document.
      if (
        link.offsetTop < nav.scrollTop ||
        link.offsetTop + link.offsetHeight > nav.scrollTop + nav.clientHeight
      ) {
        nav.scrollTop = link.offsetTop - nav.offsetTop - nav.clientHeight / 2;
      }
    } else link.removeAttribute("aria-current");
  }
}
function scheduleUpdate() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateReadingPosition);
  }
}
window.addEventListener("scroll", scheduleUpdate, { passive: true });
window.addEventListener("resize", scheduleUpdate);
window.addEventListener("hashchange", closeMenu);
updateReadingPosition();
