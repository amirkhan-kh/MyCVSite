import { animate, inView, scroll, stagger } from "motion";

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

window.__motionReady = true;

const ease = [0.22, 1, 0.36, 1] as const;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

const all = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T & Element>(selector)) as T[];

const progress = document.querySelector(".progress");
if (progress) {
  scroll(animate(progress, { scaleX: [0, 1] }, { ease: "linear" }));
}

// Pointer-following spotlight on cards; cheap CSS-variable update.
for (const el of all<HTMLElement>(".spot")) {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}

if (!reduceMotion) {
  animate(
    all("[data-hero]"),
    { opacity: [0, 1], y: [18, 0], filter: ["blur(6px)", "blur(0px)"] },
    { duration: 0.8, ease, delay: stagger(0.12, { startDelay: 0.15 }) },
  );

  inView(
    "[data-reveal]",
    (el) => {
      animate(
        el,
        { opacity: [0, 1], y: [32, 0], filter: ["blur(8px)", "blur(0px)"] },
        { duration: 0.9, ease },
      );
    },
    { margin: "0px 0px -12% 0px" },
  );

  inView(
    "[data-stagger]",
    (el) => {
      animate(
        Array.from(el.children),
        { opacity: [0, 1], y: [40, 0], scale: [0.97, 1] },
        { duration: 0.8, ease, delay: stagger(0.09) },
      );
    },
    { margin: "0px 0px -12% 0px" },
  );

  inView("[data-count]", (el) => {
    const target = Number((el as HTMLElement).dataset.count);
    if (!target) return;
    animate(0, target, {
      duration: 1.6,
      ease,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
  });

  const rail = document.querySelector("[data-rail]");
  if (rail) {
    animate(rail, { scaleX: 0 }, { duration: 0 });
    inView(rail, () => {
      animate(rail, { scaleX: [0, 1] }, { duration: 1.8, ease, delay: 0.3 });
    });
  }

  const timeline = document.querySelector<HTMLElement>("[data-timeline]");
  const fill = document.querySelector<HTMLElement>("[data-timeline-fill]");
  const tip = document.querySelector<HTMLElement>("[data-timeline-tip]");
  if (timeline && fill && tip) {
    const line = fill.parentElement as HTMLElement;
    const dots = all<HTMLElement>(".job__dot", timeline);
    let lineHeight = 0;
    let dotOffsets: number[] = [];

    // offsetTop ignores the reveal transforms on .job, so positions stay stable while cards animate in.
    const measure = () => {
      lineHeight = line.offsetHeight;
      dotOffsets = dots.map((d) => {
        const job = d.offsetParent as HTMLElement;
        return job.offsetTop + d.offsetTop + d.offsetHeight / 2 - line.offsetTop;
      });
    };
    measure();
    new ResizeObserver(measure).observe(timeline);

    scroll(
      (progress: number) => {
        const y = progress * lineHeight;
        fill.style.transform = `scaleY(${progress})`;
        tip.style.transform = `translateY(${y}px)`;
        dots.forEach((d, i) => d.classList.toggle("is-active", dotOffsets[i] <= y + 1));
      },
      { target: timeline, offset: ["start 70%", "end 70%"] },
    );
  }

  if (finePointer) {
    for (const el of all<HTMLElement>("[data-magnetic]")) {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        animate(el, { x, y }, { type: "spring", stiffness: 260, damping: 18 });
      });
      el.addEventListener("pointerleave", () => {
        animate(el, { x: 0, y: 0 }, { type: "spring", stiffness: 200, damping: 14 });
      });
    }
  }
}
