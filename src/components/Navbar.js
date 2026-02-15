"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { scrambleText } from "../utils/scramble";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  const linksRef = useRef([]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  // Scroll listener for logo animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      gsap.to(menuRef.current, {
        x: 0,
        duration: 0.8,
        ease: "power4.out",
      });
      // Clearer X animation
      gsap.to(".line-1", {
        rotate: 45,
        y: 6,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(".line-2", {
        rotate: -45,
        y: -6,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.fromTo(
        linksRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.3,
        },
      );
    } else {
      gsap.to(menuRef.current, {
        x: "100%",
        duration: 0.8,
        ease: "power4.in",
      });
      gsap.to(".line-1", {
        rotate: 0,
        y: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
      gsap.to(".line-2", {
        rotate: 0,
        y: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
    }
  }, [isOpen]);

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    toggleMenu();
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80; // Adjust for navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className={`logo-container ${isScrolled ? "scrolled" : ""}`}>
        <div className="logo-circle">
          <span className="logo-initial">P</span>
          <span className="logo-full">PARDEEP SINGH</span>
        </div>
      </div>
      <div className="nav-decor-right">
        <a href="mailto:pardeep.singh@grapesworldwide.com">
          <span onMouseEnter={scrambleText} data-text="CONTACT">
            CONTACT
          </span>
        </a>
        <span className="separator">/</span>
        <a
          href="https://linkedin.com/in/pardeep-singh-5409071a8"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={scrambleText}
          data-text="LINKEDIN"
        >
          LINKEDIN
        </a>
      </div>


      <div
        className={`menu-trigger ${isOpen ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        <div className="line line-1"></div>
        <div className="line line-2"></div>
      </div>

      <div className="off-canvas-menu" ref={menuRef}>
        <div className="menu-background-effect"></div>
        <ul className="menu-links">
          {["Home", "About", "Experience", "Projects", "Contact"].map(
            (item, index) => (
              <li key={item} ref={(el) => (linksRef.current[index] = el)}>
                <a
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => handleLinkClick(e, item.toLowerCase())}
                  onMouseEnter={scrambleText}
                >
                  <span className="link-num">0{index + 1}</span>
                  <span className="link-text" data-text={item}>
                    {item}
                  </span>
                </a>
              </li>
            ),
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
