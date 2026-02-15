"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const ThreeLiquidEffect = () => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    // Initial Size
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mouse = new THREE.Vector2(0.5, 0.5);
    const targetMouse = new THREE.Vector2(0.5, 0.5);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHover;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 uv = vUv;
        vec2 m = uMouse;
        
        // Base dark background
        vec3 color = vec3(0.03, 0.03, 0.04);
        
        // === METABALL / AMOEBA BLOBS ===
        float metaball = 0.0;
        
        // Create multiple organic blobs
        for(float i = 0.0; i < 5.0; i++) {
          // Animated blob positions
          float angle = i * 1.2566 + uTime * 0.15; // Distribute around circle
          float radius = 0.3 + sin(uTime * 0.1 + i) * 0.15;
          
          vec2 blobPos = vec2(
            0.5 + cos(angle) * radius,
            0.5 + sin(angle) * radius
          );
          
          // Add organic movement
          blobPos.x += sin(uTime * 0.2 + i * 2.0) * 0.1;
          blobPos.y += cos(uTime * 0.25 + i * 1.5) * 0.1;
          
          // Blob size variation
          float blobSize = 0.15 + sin(uTime * 0.3 + i) * 0.05;
          
          // Calculate distance and add to metaball field
          float dist = distance(uv, blobPos);
          metaball += blobSize / (dist + 0.01);
        }
        
        // Mouse interaction blob
        float mouseDist = distance(uv, m);
        metaball += (0.2 / (mouseDist + 0.01)) * uHover * 0.5;
        
        // Create blob shape with threshold
        float blobMask = smoothstep(1.8, 2.0, metaball);
        
        // === COLORFUL OUTLINES ===
        // Multiple outline layers with different colors
        float outline1 = smoothstep(1.9, 2.0, metaball) - smoothstep(2.0, 2.1, metaball);
        float outline2 = smoothstep(2.0, 2.1, metaball) - smoothstep(2.1, 2.2, metaball);
        float outline3 = smoothstep(2.1, 2.2, metaball) - smoothstep(2.2, 2.3, metaball);
        
        // Gradient colors for outlines (green, teal, purple like reference)
        vec3 color1 = vec3(0.3, 0.8, 0.4); // Green
        vec3 color2 = vec3(0.4, 0.7, 0.8); // Teal
        vec3 color3 = vec3(0.6, 0.4, 0.7); // Purple
        
        // Apply colorful outlines
        color += outline1 * color1 * 0.6;
        color += outline2 * color2 * 0.5;
        color += outline3 * color3 * 0.4;
        
        // Inner blob fill (subtle)
        color += blobMask * vec3(0.08, 0.08, 0.1) * 0.3;
        
        // === SUBTLE TEXTURE ===
        // Add organic noise texture
        float organicNoise = noise(uv * 15.0 + uTime * 0.05);
        color += organicNoise * 0.015 * blobMask;
        
        // Fine grain
        float grain = (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
        color += grain;
        
        // Vignette
        float vignette = 1.0 - smoothstep(0.2, 1.0, length(uv - 0.5));
        color *= vignette;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0.0 }, // Added uHover
      uResolution: { value: new THREE.Vector2(width, height) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        if (uniforms.uResolution) {
          uniforms.uResolution.value.set(width, height);
        }
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const onMouseMove = (event) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMouse.x = (event.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (event.clientY - rect.top) / rect.height;

      // Ensure hover is active if mouse is moving
      if (uniforms.uHover.value < 0.1) {
        gsap.to(uniforms.uHover, {
          value: 1.0,
          duration: 1.2,
          ease: "expo.out",
        });
      }
    };

    const onMouseEnter = () => {
      gsap.to(uniforms.uHover, { value: 1.0, duration: 1.2, ease: "expo.out" });
    };

    const onMouseLeave = () => {
      gsap.to(uniforms.uHover, { value: 0.0, duration: 1.2, ease: "expo.out" });
    };

    window.addEventListener("mousemove", onMouseMove);
    if (containerRef.current) {
      containerRef.current.addEventListener("mouseenter", onMouseEnter);
      containerRef.current.addEventListener("mouseleave", onMouseLeave);
    }

    let animationFrameId;
    const animate = () => {
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      uniforms.uTime.value += 0.01;
      uniforms.uMouse.value.set(mouse.x, mouse.y);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      if (containerRef.current) {
        containerRef.current.removeEventListener("mouseenter", onMouseEnter);
        containerRef.current.removeEventListener("mouseleave", onMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
      if (
        containerRef.current &&
        renderer.domElement.parentNode === containerRef.current
      ) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
};

export default ThreeLiquidEffect;
