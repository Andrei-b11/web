// Navegación móvil
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Animación de números en las estadísticas
const statNumbers = document.querySelectorAll('.stat-number');

const animateNumber = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateNumber = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = target;
        }
    };

    updateNumber();
};

// Observer para animar cuando los elementos sean visibles
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateNumber(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

statNumbers.forEach(stat => {
    observer.observe(stat);
});

// Animación de scroll suave para la navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Cambiar estilo de navbar al hacer scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 5px 30px rgba(255, 102, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(255, 102, 0, 0.1)';
    }
});

// Animación de aparición de elementos
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .gallery-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Inicializar opacidad de elementos
document.querySelectorAll('.service-card, .gallery-item').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px)';
    element.style.transition = 'all 0.6s ease';
});

window.addEventListener('scroll', animateOnScroll);
animateOnScroll(); // Ejecutar al cargar

// Efecto de partículas en el hero (opcional)
const createParticle = () => {
    const hero = document.querySelector('.hero');
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '5px';
    particle.style.height = '5px';
    particle.style.background = 'var(--primary-color)';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.opacity = '0.5';
    particle.style.animation = 'float 3s ease-in-out infinite';
    hero.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 3000);
};

// Crear partículas cada cierto tiempo
setInterval(createParticle, 2000);

// Formulario de contacto
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Aquí puedes agregar lógica para enviar el formulario
        // Por ejemplo, usando fetch() para enviar a un servidor
        
        alert('¡Mensaje enviado! Gracias por contactarnos.');
        contactForm.reset();
    });
}

// Efecto de hover en las tarjetas de servicio
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Animación del título principal
const title = document.querySelector('.animate-title');
if (title) {
    const text = title.textContent;
    title.textContent = '';
    title.style.opacity = '1';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    
    setTimeout(typeWriter, 500);
}

// Efecto parallax suave
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-circle');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.2);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

console.log('🔥 Sitio web cargado correctamente!');

