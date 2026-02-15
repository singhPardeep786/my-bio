"use client";

import { useEffect } from "react";
import Image from "next/image";
import LiquidImage from "../components/LiquidImage";
import ThreeLiquidEffect from "../components/ThreeLiquidEffect";
import LiquidText from "../components/LiquidText";
import { scrambleText } from "../utils/scramble";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    // About Section Animations
    gsap.from(".about-bio", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about-bio",
        start: "top 85%",
      },
    });

    gsap.from(".skill-category", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".skills-grid",
        start: "top 80%",
      },
    });

    // Vertical Titles Reveal
    gsap.utils.toArray(".vertical-title").forEach((title) => {
      gsap.from(title, {
        opacity: 0,
        x: -20,
        duration: 1,
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
        },
      });
    });
  }, []);

  return (
    <>
      <section className="hero" id="home">
        <ThreeLiquidEffect />
        <div className="grid-overlay"></div>
        <div className="site-wrapper hero-site-wrapper">
          <div className="hero-branding">
            <h1>
              PARDEEP
              <br />
              SINGH
            </h1>
          </div>

          <div className="corner-widget bottom-left">
            <p className="vertical-copyright">@pardeepsingh Inc.</p>
          </div>

          <div className="corner-widget bottom-right">
            <div className="hero-info-footer">
              <p className="footer-description">
                Digital craftsmanship
                <br />
                through the lens of
                <br />
                motion and interaction.
              </p>
              <div className="scroll-indicator">
                <span>scroll</span>
                <div className="line"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="site-wrapper">
          <div className="about-grid-lines">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
          <span
            className="vertical-title"
            data-text="#01 ABOUT"
            onMouseEnter={scrambleText}
          >
            #01 ABOUT
          </span>
          <div className="content">
            <div className="liquid-text-wrapper">
              <LiquidText
                text={
                  "CRAFTING DIGITAL\nEXPERIENCES AT THE\nINTERSECTION OF ART\nAND CODE."
                }
              />
            </div>
            <p className="about-bio">
              As a Creative Developer, I bridge the gap between imagination and
              reality. I specialize in building immersive web experiences that
              prioritize fluid motion, technical precision, and human-centric
              design.
            </p>
            <div className="skills-grid">
              <div className="skill-category">
                <h3>Frontend</h3>
                <div className="skill-tags">
                  {[
                    "React.js",
                    "Next.js",
                    "JavaScript",
                    "GSAP",
                    "SCSS",
                    "Three.js",
                  ].map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
              <div className="skill-category">
                <h3>Tools</h3>
                <div className="skill-tags">
                  {["Figma", "Photoshop", "Git", "Webpack", "Vite"].map(
                    (skill) => (
                      <span key={skill}>{skill}</span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="projects" id="projects">
        <div className="site-wrapper">
          <span
            className="vertical-title"
            data-text="#02 PROJECTS"
            onMouseEnter={scrambleText}
          >
            #02 PROJECTS
          </span>
          <div className="project-grid">
            <div className="project-item">
              <LiquidImage
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1964"
                alt="Pay10"
              />
              <h3>Pay10</h3>
              <p>Fintech Solution</p>
            </div>
            <div className="project-item">
              <LiquidImage
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070"
                alt="SR Eco Park"
              />
              <h3>SR Eco Park</h3>
              <p>Eco Living</p>
            </div>
          </div>
        </div>
      </section>

      <section className="experience" id="experience">
        <div className="site-wrapper">
          <span
            className="vertical-title"
            data-text="#03 EXPERIENCE"
            onMouseEnter={scrambleText}
          >
            #03 EXPERIENCE
          </span>
          <div className="exp-item">
            <h3>Executive Frontend Developer</h3>
            <p>Grapes Worldwide | Nov 2024 – Present</p>
          </div>
          <div className="exp-item">
            <h3>Web Designer</h3>
            <p>Teamworks New Media Pvt. Ltd. | Dec 2023 – Oct 2025</p>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="site-wrapper">
          <span
            className="vertical-title"
            data-text="#04 CONTACT"
            onMouseEnter={scrambleText}
          >
            #04 CONTACT
          </span>
          <div className="contact-info">
            <h2>Ready to elevate your digital presence?</h2>
            <p
              data-text="pardeep90191170@gmail.com"
              onMouseEnter={scrambleText}
            >
              pardeep90191170@gmail.com
            </p>
            <p data-text="+91 7087950828" onMouseEnter={scrambleText}>
              +91 7087950828
            </p>
            <a
              href="https://linkedin.com/in/pardeep-singh-5409071a8"
              target="_blank"
              rel="noopener noreferrer"
              data-text="LinkedIn Profile"
              onMouseEnter={scrambleText}
            >
              LinkedIn Profile
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
