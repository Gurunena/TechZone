document.addEventListener('DOMContentLoaded', function (){
    const form = document.getElementById('contactForm');
    const alertBox = document.getElementById('contactAlert');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (form.checkValidity()) {

            alertBox.classList.remove('d-none');
            form.reset();

            window.scrollTo({ top:0, behavior: 'smooth' });
        } else {
            form.reportValiditty();
        }
    });
});
