document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile Menu Toggle & Navigation
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('navOverlay');
    const mobileMenuIcon = document.querySelector('.mobile-menu-btn i');

    function openMobileMenu() {
        if (!navLinks) return;
        navLinks.classList.add('active');
        if (navOverlay) navOverlay.classList.add('active');
        if (mobileMenuIcon) {
            mobileMenuIcon.classList.remove('fa-bars');
            mobileMenuIcon.classList.add('fa-xmark');
        }
        document.body.classList.add('nav-open');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        if (!navLinks) return;
        navLinks.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        if (mobileMenuIcon) {
            mobileMenuIcon.classList.remove('fa-xmark');
            mobileMenuIcon.classList.add('fa-bars');
        }
        document.body.classList.remove('nav-open');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        if (navOverlay) {
            navOverlay.addEventListener('click', closeMobileMenu);
        }

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // Close mobile menu when a navigation or CTA link is clicked
    const menuLinks = document.querySelectorAll('.nav-link, .mobile-nav-cta');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Navbar scroll effect
    const header = document.getElementById('header');
    const navItems = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active link highlighting on scroll
        let current = '';
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // Contact Form Logic (Resend API prin Vercel Serverless Function)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const formActions = document.getElementById('formActions');
        const formSuccessState = document.getElementById('formSuccessState');
        const resendBtn = document.getElementById('resendBtn');

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nume = document.getElementById('name').value;
            const telefon = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const dispozitiv = document.getElementById('device').value;
            const mesaj = document.getElementById('message').value;
            const submitBtn = document.getElementById('submitBtn') || contactForm.querySelector('button[type="submit"]');

            // Schimbam textul butonului în timpul trimiterii
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Se trimite... <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        nume: nume,
                        telefon: telefon,
                        email: email,
                        dispozitiv: dispozitiv,
                        mesaj: mesaj
                    })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    if (formActions && formSuccessState) {
                        formActions.style.display = 'none';
                        formSuccessState.style.display = 'flex';
                    } else {
                        alert("Mesajul a fost trimis cu succes! Te vom contacta în curând.");
                    }
                    contactForm.reset();
                } else {
                    alert(result.error || "A apărut o eroare. Te rugăm să încerci din nou.");
                    console.error(result);
                }
            } catch (error) {
                alert("Eroare de rețea. Verifică conexiunea la internet.");
                console.error(error);
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });

        if (resendBtn && formActions && formSuccessState) {
            resendBtn.addEventListener('click', () => {
                formSuccessState.style.display = 'none';
                formActions.style.display = 'block';
            });
        }
    }

    // Slideshow Logic
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlideIndex = 0;
    let slideInterval;

    function showSlide(index) {
        if (slides.length === 0) return;
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlideIndex = (index + slides.length) % slides.length;
        slides[currentSlideIndex].classList.add('active');
        if (dots.length > currentSlideIndex) {
            dots[currentSlideIndex].classList.add('active');
        }
    }

    function nextSlide() {
        showSlide(currentSlideIndex + 1);
    }

    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 3500); // changes every 3.5 seconds
    }

    // Global functions for inline HTML event handlers (onclick="currentSlide(N)")
    window.currentSlide = function(index) {
        clearInterval(slideInterval);
        showSlide(index);
        startSlideShow();
    };

    window.moveSlide = function(direction) {
        clearInterval(slideInterval);
        showSlide(currentSlideIndex + direction);
        startSlideShow();
    };

    if (slides.length > 0) {
        startSlideShow();
    }

    // FAQ Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            
            // Close other open FAQ items
            const openItems = document.querySelectorAll('.accordion-item.open');
            openItems.forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });
            
            item.classList.toggle('open');
            if (item.classList.contains('open')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });
});

