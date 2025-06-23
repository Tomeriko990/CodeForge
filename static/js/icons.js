function getResponsiveFontSize() {
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    return Math.max(10, Math.min(16, vw * 0.014));
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons({
      attrs: {
        width: "clamp(16px, 4vw, 22px)",
        height: "clamp(16px, 4vw, 22px)",
        stroke: "#ccc",
        "stroke-width": 1.5,
      },
    });
  });
  