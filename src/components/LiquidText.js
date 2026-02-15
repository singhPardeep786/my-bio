"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const LiquidText = ({ text, className }) => {
  const containerRef = useRef();
  const rendererRef = useRef();
  const meshRef = useRef();
  const materialRef = useRef();
  const textureRef = useRef();
  const uniformsRef = useRef({
    uTexture: { value: null },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0.0 },
    uHover: { value: 0.0 },
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- TEXT TEXTURE ---
    const textCanvas = document.createElement("canvas");
    const ctx = textCanvas.getContext("2d");
    textCanvas.width = 2048;
    textCanvas.height = 1024;

    const renderText = () => {
      ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

      const lines = text.split("\n");
      const PADDING = 200; // Horizontal safe zone
      const availableWidth = textCanvas.width - PADDING;

      // Initial font size
      let fontSize = 240;
      ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;

      // Measure and scale down if any line exceeds available width
      lines.forEach((line) => {
        const metrics = ctx.measureText(line.toUpperCase());
        if (metrics.width > availableWidth) {
          const ratio = availableWidth / metrics.width;
          fontSize = Math.floor(fontSize * ratio);
        }
      });

      // Apply final font settings
      ctx.fillStyle = "white";
      ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lineHeight = fontSize * 1.05;
      const totalHeight = lines.length * lineHeight;
      const startY = (textCanvas.height - totalHeight) / 2 + lineHeight / 2;

      lines.forEach((line, i) => {
        ctx.fillText(
          line.toUpperCase(),
          textCanvas.width / 2,
          startY + i * lineHeight,
        );
      });
    };
    renderText();

    const texture = new THREE.CanvasTexture(textCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;
    uniformsRef.current.uTexture.value = texture;

    // --- SHADER MATERIAL ---
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
      varying vec2 vUv;

      float noise(vec2 p) {
        return sin(p.x * 15.0 + uTime) * cos(p.y * 15.0 + uTime) * 0.01;
      }

      void main() {
        vec2 uv = vUv;
        
        // Liquid distortion logic
        float dist = distance(uv, uMouse);
        float circle = smoothstep(0.45, 0.0, dist);
        
        vec2 displacement = vec2(
          noise(uv + uTime * 0.05),
          noise(uv - uTime * 0.05)
        );

        // Responsive Warp
        displacement += (uv - uMouse) * circle * 0.18;
        
        vec2 finalUv = uv + displacement * uHover;

        // Visual Polish: Chromatic Aberration
        float r = texture2D(uTexture, finalUv + displacement * 0.04).r;
        float g = texture2D(uTexture, finalUv).g;
        float b = texture2D(uTexture, finalUv - displacement * 0.04).b;
        float a = texture2D(uTexture, finalUv).a;

        gl_FragColor = vec4(r, g, b, a);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // --- EVENTS ---
    const onMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      gsap.to(uniformsRef.current.uMouse.value, {
        x: x,
        y: y,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    const onMouseEnter = () => {
      gsap.to(uniformsRef.current.uHover, {
        value: 1.0,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    const onMouseLeave = () => {
      gsap.to(uniformsRef.current.uHover, {
        value: 0.0,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    containerRef.current.addEventListener("mousemove", onMouseMove);
    containerRef.current.addEventListener("mouseenter", onMouseEnter);
    containerRef.current.addEventListener("mouseleave", onMouseLeave);

    // --- ANIMATION LOOP ---
    let frameId;
    const animate = () => {
      uniformsRef.current.uTime.value += 0.03;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // --- RESIZE ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeEventListener("mousemove", onMouseMove);
      containerRef.current?.removeEventListener("mouseenter", onMouseEnter);
      containerRef.current?.removeEventListener("mouseleave", onMouseLeave);

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current.domElement.remove();
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`liquid-text-container ${className}`}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
};

export default LiquidText;
