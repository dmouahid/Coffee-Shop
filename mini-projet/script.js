document.addEventListener('DOMContentLoaded', () => {

    const navToggle = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.navigation a');



    navLinks.forEach(link => link.addEventListener('click', () => {
        if (navToggle.checked) {
          navToggle.checked = false;
          updateNavA11y();
        }
    }));

    const navBlur = document.getElementById('nav-blur');

    if (navBlur) {
        navBlur.addEventListener('click', () => {
            if (navToggle.checked) {
                navToggle.checked = false;
                updateNavA11y();
            }
        });
    }




      

});







document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault(); 
        
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        
        const contactMessage = {
            name: name,
            email: email,
            message: message,
            date: new Date().toLocaleString()
        };

        
        let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];

        
        messages.push(contactMessage);

        
        localStorage.setItem('contactMessages', JSON.stringify(messages));

        
        document.getElementById('contactForm').reset();

        alert('Votre message a été envoyé avec succès!');
    });