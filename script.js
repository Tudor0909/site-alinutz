document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuIcon = document.querySelector('.mobile-menu-btn i');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        if (navLinks.classList.contains('active')) {
            mobileMenuIcon.classList.remove('fa-bars');
            mobileMenuIcon.classList.add('fa-xmark');
        } else {
            mobileMenuIcon.classList.remove('fa-xmark');
            mobileMenuIcon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuIcon.classList.remove('fa-xmark');
            mobileMenuIcon.classList.add('fa-bars');
        });
    });

    // Navbar scroll effect
    const header = document.getElementById('header');
    
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
            if (scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
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
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nume = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const dispozitiv = document.getElementById('device').value;
            const mesaj = document.getElementById('message').value;
            const submitBtn = contactForm.querySelector('button[type="submit"]');

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
                        email: email,
                        dispozitiv: dispozitiv,
                        mesaj: mesaj
                    })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert("Mesajul a fost trimis cu succes! Te vom contacta în curând.");
                    contactForm.reset();
                } else {
                    alert("A apărut o eroare. Te rugăm să încerci din nou.");
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

