"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const LiquidHeading = ({ text, className }) => {
  const containerRef = useRef();
  const rendererRef = useRef();

  // Use let/const for refs that persist but don't cause rerenders
  const uniformsRef = useRef({
    uTexture: { value: null },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0.0 },
    uHover: { value: 1.0 }, // Always active like skills
    uAspect: { value: 1.0 },
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Use container dimensions directly to ensure 1:1 pixel mapping (no stretch)
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- SCENE ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- TEXT TEXTURE ---
    const textCanvas = document.createElement("canvas");
    const ctx = textCanvas.getContext("2d");

    // Match renderer resolution for crisp text
    const dpr = renderer.getPixelRatio();
    textCanvas.width = width * dpr;
    textCanvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const renderText = () => {
      ctx.clearRect(0, 0, width, height);

      // Dynamic font sizing: fit height comfortably
      // Use Syne font for the heading style
      const fontSize = Math.floor(height * 0.65);
      ctx.font = `800 ${fontSize}px 'Syne', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

      // Draw text centered
      ctx.fillText(text.toUpperCase(), width / 2, height / 2 + 3);
    };
    renderText();

    const texture = new THREE.CanvasTexture(textCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    uniformsRef.current.uTexture.value = texture;
    uniformsRef.current.uAspect.value = width / height;

    // --- SHADER ---
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

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
        float influence = smoothstep(0.4, 0.0, dist) * uHover;

        // Gentle wave ripple (matching skills)
        float ripple = sin(dist * 20.0 - uTime * 2.5) * 0.005 * influence;

        // Soft push away from cursor
        vec2 dir = normalize(diff + 0.0001);
        vec2 displacement = dir * ripple;

        // Very subtle ambient drift (increased slightly)
        displacement.x += sin(uv.y * 5.0 + uTime * 0.8) * 0.003 * uHover;
        displacement.y += cos(uv.x * 5.0 + uTime * 0.8) * 0.003 * uHover;
        
        vec2 finalUv = uv + displacement;
        
        // Chromatic aberration near cursor
        float ca = 0.002 * influence;
        
        float r = texture2D(uTexture, finalUv + vec2(ca, 0.0)).r;
        float g = texture2D(uTexture, finalUv).g;
        float b = texture2D(uTexture, finalUv - vec2(ca, 0.0)).b;
        float a = texture2D(uTexture, finalUv).a;
        
        // Faint color tint like skills
        vec3 tint = vec3(0.3, 0.6, 1.0) * influence * 0.04;

        gl_FragColor = vec4(r + tint.r, g + tint.g, b + tint.b, a);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      gsap.to(uniformsRef.current.uMouse.value, {
        x,
        y,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    container.addEventListener("mousemove", onMouseMove);

    // --- ANIMATION ---
    let frameId;
    const animate = () => {
      uniformsRef.current.uTime.value += 0.02;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w && h) {
          renderer.setSize(w, h);
          const dpr = renderer.getPixelRatio();
          textCanvas.width = w * dpr;
          textCanvas.height = h * dpr;
          ctx.scale(dpr, dpr);
          renderText();
          texture.needsUpdate = true;
          uniformsRef.current.uAspect.value = w / h;
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`liquid-heading-container ${className || ""}`}
      style={{
        width: "100%",
        maxWidth: "600px",
        height: "100px",
        margin: "0 auto 3rem auto", // Centered with margin bottom
        position: "relative",
        opacity: 0.8, // Slightly faded style for heading
      }}
    />
  );
};

export default LiquidHeading;
