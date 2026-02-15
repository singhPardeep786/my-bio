"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";

const LiquidSkills = ({ skills }) => {
  const containerRef = useRef();
  const rendererRef = useRef();
  const textureRef = useRef();
  const canvasElRef = useRef();
  const frameIdRef = useRef();
  const uniformsRef = useRef(null);

  const renderSkillsToCanvas = useCallback(
    (containerWidth) => {
      const canvas = canvasElRef.current || document.createElement("canvas");
      canvasElRef.current = canvas;
      const ctx = canvas.getContext("2d");

      const dpr = Math.min(window.devicePixelRatio, 2);
      const W = containerWidth;
      const isMobile = W < 500;
      const isTablet = W >= 500 && W < 900;

      // Responsive sizing
      const titleSize = isMobile ? 11 : isTablet ? 13 : 14;
      const pillFontSize = isMobile ? 14 : isTablet ? 16 : 18;
      const pillPadX = isMobile ? 16 : isTablet ? 20 : 26;
      const pillPadY = isMobile ? 8 : isTablet ? 10 : 12;
      const pillGap = isMobile ? 8 : isTablet ? 10 : 14;
      const pillHeight = pillFontSize + pillPadY * 2;
      const categoryGap = isMobile ? 40 : isTablet ? 50 : 60;
      const rowGap = isMobile ? 10 : 12;
      const titleToTagGap = isMobile ? 18 : 24;
      const topPad = isMobile ? 20 : 36;

      // Use oversized canvas for measurement pass
      canvas.width = W * dpr;
      canvas.height = 1000 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let totalH = topPad;

      const layoutData = skills.map((category) => {
        totalH += titleSize + titleToTagGap;

        // Measure and wrap pills into rows
        ctx.font = `500 ${pillFontSize}px 'Inter', sans-serif`;
        const rows = [];
        let currentRow = [];
        let rowWidth = 0;
        const maxWidth = W - (isMobile ? 20 : 48);

        category.items.forEach((item) => {
          const textW = ctx.measureText(item).width;
          const pw = textW + pillPadX * 2;
          if (currentRow.length > 0 && rowWidth + pillGap + pw > maxWidth) {
            rows.push(currentRow);
            currentRow = [{ text: item, width: pw }];
            rowWidth = pw;
          } else {
            if (currentRow.length > 0) rowWidth += pillGap;
            currentRow.push({ text: item, width: pw });
            rowWidth += pw;
          }
        });
        if (currentRow.length > 0) rows.push(currentRow);

        const blockH = rows.length * pillHeight + (rows.length - 1) * rowGap;
        totalH += blockH + categoryGap;

        return { category, rows };
      });

      totalH -= categoryGap;
      totalH += topPad;

      // Set final canvas size
      canvas.width = W * dpr;
      canvas.height = totalH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, totalH);

      let y = topPad;

      layoutData.forEach(({ category, rows }) => {
        // Draw category title — manual letter-spacing
        ctx.font = `700 ${titleSize}px 'Inter', sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.textBaseline = "top";
        const spacing = 5;
        const titleChars = category.title.toUpperCase().split("");
        let titleW = 0;
        titleChars.forEach((ch) => {
          titleW += ctx.measureText(ch).width + spacing;
        });
        titleW -= spacing;
        let tx = (W - titleW) / 2;
        titleChars.forEach((ch) => {
          ctx.textAlign = "left";
          ctx.fillText(ch, tx, y);
          tx += ctx.measureText(ch).width + spacing;
        });

        y += titleSize + titleToTagGap;

        // Draw pill rows
        ctx.font = `500 ${pillFontSize}px 'Inter', sans-serif`;

        rows.forEach((row) => {
          const rowTotalW =
            row.reduce((a, p) => a + p.width, 0) + (row.length - 1) * pillGap;
          let rx = (W - rowTotalW) / 2;

          row.forEach((pill) => {
            const px = rx;
            const py = y;
            const pw = pill.width;
            const radius = pillHeight / 2;

            // Subtle fill
            ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
            ctx.beginPath();
            ctx.roundRect(px, py, pw, pillHeight, radius);
            ctx.fill();

            // Border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(px, py, pw, pillHeight, radius);
            ctx.stroke();

            // Text
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(pill.text, px + pw / 2, py + pillHeight / 2 + 1);

            rx += pw + pillGap;
          });

          y += pillHeight + rowGap;
        });

        y += categoryGap - rowGap;
      });

      return { width: W, height: totalH };
    },
    [skills],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let cW = container.clientWidth;

    // --- SCENE ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Initial render
    const dims = renderSkillsToCanvas(cW);
    container.style.height = dims.height + "px";
    renderer.setSize(cW, dims.height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const texture = new THREE.CanvasTexture(canvasElRef.current);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureRef.current = texture;

    const uniforms = {
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0.0 },
      uHover: { value: 1.0 },
      uAspect: { value: cW / dims.height },
    };
    uniformsRef.current = uniforms;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    // Gentle liquid effect — only activates on hover
    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform float uTime;
      uniform float uHover;
      uniform float uAspect;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Aspect-correct distance to mouse
        vec2 diff = uv - uMouse;
        diff.x *= uAspect;
        float dist = length(diff);

        // Smooth falloff around cursor
        float influence = smoothstep(0.35, 0.0, dist) * uHover;

        // Gentle wave ripple
        float ripple = sin(dist * 25.0 - uTime * 2.5) * 0.006 * influence;

        // Soft push away from cursor
        vec2 dir = normalize(diff + 0.0001);
        vec2 displacement = dir * ripple;

        // Very subtle ambient drift
        displacement.x += sin(uv.y * 6.0 + uTime * 0.8) * 0.002 * uHover;
        displacement.y += cos(uv.x * 6.0 + uTime * 0.8) * 0.002 * uHover;

        vec2 finalUv = uv + displacement;

        // Subtle chromatic aberration near cursor
        float ca = 0.003 * influence;
        float r = texture2D(uTexture, finalUv + vec2(ca, 0.0)).r;
        float g = texture2D(uTexture, finalUv).g;
        float b = texture2D(uTexture, finalUv - vec2(ca, 0.0)).b;
        float a = texture2D(uTexture, finalUv).a;

        // Faint color tint near cursor
        vec3 tint = vec3(0.3, 0.6, 1.0) * influence * 0.06;

        gl_FragColor = vec4(r + tint.r, g + tint.g, b + tint.b, a);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- EVENTS ---
    const onMouseMove = (e) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      gsap.to(uniforms.uMouse.value, {
        x,
        y,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    container.addEventListener("mousemove", onMouseMove);

    // --- ANIMATE ---
    const animate = () => {
      uniforms.uTime.value += 0.016;
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // --- RESIZE ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0 && Math.abs(w - cW) > 4) {
          cW = w;
          const newDims = renderSkillsToCanvas(w);
          container.style.height = newDims.height + "px";
          renderer.setSize(w, newDims.height);
          uniforms.uAspect.value = w / newDims.height;
          texture.image = canvasElRef.current;
          texture.needsUpdate = true;
        }
      }
    });
    resizeObserver.observe(container);

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current.domElement.remove();
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [skills, renderSkillsToCanvas]);

  return (
    <div
      ref={containerRef}
      className="liquid-skills-container"
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
    />
  );
};

export default LiquidSkills;
