import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "section",
  "article",
  ".feature-card",
  ".position-card",
  ".home-trust-item",
  ".home-step",
  ".home-benefit-card",
].join(",");

export function useScrollReveal(scope: string, route: string) {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(scope);
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    let revealFrame = 0;
    const revealElementsInView = () => {
      cancelAnimationFrame(revealFrame);
      revealFrame = requestAnimationFrame(() => {
        container.querySelectorAll<HTMLElement>(".scroll-reveal:not(.is-visible)").forEach((element) => {
          const bounds = element.getBoundingClientRect();
          if (bounds.top < window.innerHeight && bounds.bottom > 0) {
            element.classList.add("is-visible");
            observer.unobserve(element);
          }
        });
      });
    };

    let revealIndex = 0;
    const observeElements = (root: ParentNode) => {
      const elements: HTMLElement[] = root instanceof HTMLElement && root.matches(REVEAL_SELECTOR)
        ? [root, ...root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)]
        : Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));

      elements.forEach((element) => {
        if (element.classList.contains("scroll-reveal")) return;
        element.classList.add("scroll-reveal");
        element.setAttribute("data-scroll-reveal", "");
        element.style.setProperty("--scroll-reveal-delay", `${(revealIndex++ % 4) * 70}ms`);
        observer.observe(element);
      });
      revealElementsInView();
    };

    observeElements(container);
    container.classList.add("scroll-reveal-enabled");
    window.addEventListener("scroll", revealElementsInView, { passive: true });
    window.addEventListener("resize", revealElementsInView);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) observeElements(node);
      }));
    });
    mutations.observe(container, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      cancelAnimationFrame(revealFrame);
      window.removeEventListener("scroll", revealElementsInView);
      window.removeEventListener("resize", revealElementsInView);
      container.classList.remove("scroll-reveal-enabled");
    };
  }, [route, scope]);
}
