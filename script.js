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

    // Contact Form Logic (Web3Forms API - Trimite direct in fundal)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // ATENȚIE: Aici trebuie să pui cheia de la Web3Forms
            const WEB3FORMS_ACCESS_KEY = "PUNE_CHEIA_AICI"; 
            
            const nume = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const dispozitiv = document.getElementById('device').value;
            const mesaj = document.getElementById('message').value;
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            
            if(WEB3FORMS_ACCESS_KEY === "PUNE_CHEIA_AICI") {
                alert("Te rog adaugă cheia Web3Forms în fișierul script.js pentru a putea trimite mesaje!");
                return;
            }

            // Schimbam textul butonului în timpul trimiterii
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Se trimite... <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        subject: `Mesaj nou de la ${nume} - Alinutz Service`,
                        from_name: nume,
                        email: email,
                        Dispozitiv: dispozitiv,
                        Mesaj: mesaj
                    })
                });

                const result = await response.json();
                if (response.status === 200) {
                    alert("Mesajul a fost trimis cu succes! Te vom contacta în curând.");
                    contactForm.reset();
                } else {
                    alert("A apărut o eroare. Te rugăm să încerci din nou.");
                    console.log(result);
                }
            } catch (error) {
                alert("Eroare de rețea. Verifică conexiunea la internet.");
                console.log(error);
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
