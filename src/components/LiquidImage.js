"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const LiquidImage = ({ src, alt, className }) => {
  const containerRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    // Modern Three.js color space
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    canvasRef.current.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const texture = loader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0.0 },
      uTime: { value: 0.0 },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform float uHover;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        
        // Liquid displacement
        float dist = distance(uv, uMouse);
        float ripple = smoothstep(0.6, 0.0, dist) * uHover;
        
        // Displacement logic
        vec2 displacedUv = uv + (uv - uMouse) * ripple * 0.1;
        
        // Subtle drift
        displacedUv.x += sin(uv.y * 5.0 + uTime) * 0.005 * uHover;
        displacedUv.y += cos(uv.x * 5.0 + uTime) * 0.005 * uHover;
        
        vec4 color = texture2D(uTexture, displacedUv);
        
        // Fade out slightly if not hovered to match mysterious aesthetic
        color.a *= mix(0.8, 1.0, uHover);
        
        gl_FragColor = color;
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(containerRef.current);

    const onMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      uniforms.uMouse.value.x = (e.clientX - rect.left) / rect.width;
      uniforms.uMouse.value.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    const onMouseEnter = () => {
      gsap.to(uniforms.uHover, { value: 1.0, duration: 0.8, ease: "expo.out" });
    };

    const onMouseLeave = () => {
      gsap.to(uniforms.uHover, { value: 0.0, duration: 0.8, ease: "expo.out" });
    };

    containerRef.current.addEventListener("mousemove", onMouseMove);
    containerRef.current.addEventListener("mouseenter", onMouseEnter);
    containerRef.current.addEventListener("mouseleave", onMouseLeave);

    let animationFrameId;
    const animate = () => {
      uniforms.uTime.value += 0.02;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", onMouseMove);
        containerRef.current.removeEventListener("mouseenter", onMouseEnter);
        containerRef.current.removeEventListener("mouseleave", onMouseLeave);
      }
      if (
        canvasRef.current &&
        renderer.domElement.parentNode === canvasRef.current
      ) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`liquid-image-container ${className}`}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <img
        src={src}
        alt={alt}
        style={{
          position: "absolute",
          pointerEvents: "none",
          visibility: "hidden",
        }}
      />
    </div>
  );
};

export default LiquidImage;
