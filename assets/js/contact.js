document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('contactForm');
    const alertBox = document.getElementById('contactAlert');

    if (!form) {
        return;
    }

    $(document).ready(function () {

        // =====================================================
        // TASK 1 - DOM TRAVERSAL
        // =====================================================
        $("#contactForm").find(
            "input, select, textarea"
        );


        // =====================================================
        // TASK 2 - DOM MODIFICATION
        // =====================================================
        // Form submit event
        $("#contactForm").on("submit", function (e) {

            e.preventDefault();

            if (form.checkValidity()) {

                // Show existing alert
                if (alertBox) {
                    alertBox.classList.remove('d-none');
                }

                // Get user's name
                const name = $("#fullName").val();

                // Dynamically add message
                $("#jqueryMessage").remove();

                $("#contactForm").after(
                    '<div id="jqueryMessage" class="alert alert-success mt-3">' +
                    'Thank you, ' + name + '! Your message has been submitted successfully.' +
                    '</div>'
                );

                // Reset form
                form.reset();

                // Scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            } else {

                // HTML5 validation
                form.reportValidity();

            }

        });


        // =====================================================
        // TASK 3 - DOM ATTRIBUTE MODIFICATION
        // =====================================================
        $("#email").attr(
            "placeholder",
            "Enter your email address"
        );


        // =====================================================
        // TASK 4 - CSS MANIPULATION
        // =====================================================
        $("#contactForm input, #contactForm textarea, #contactForm select")
            .on("focus", function () {

                $(this).css({
                    "border": "2px solid #0d6efd",
                    "box-shadow": "0 0 5px rgba(13, 110, 253, 0.25)"
                });

            })
            .on("blur", function () {

                $(this).css({
                    "border": "",
                    "box-shadow": ""
                });

            });


        // =====================================================
        // TASK 5 - JAVASCRIPT EFFECTS
        // =====================================================
        $("#contactForm").on("submit", function () {

            if (form.checkValidity()) {

                $("#jqueryMessage")
                    .hide()
                    .fadeIn(600);

            }

        });


        // =====================================================
        // TASK 6 - HTML EVENTS
        // =====================================================
        $("#resetBtn").on("click", function () {

            $("#jqueryMessage")
                .stop(true, true)
                .fadeOut(400, function () {

                    $(this).remove();

                });

        });


        // =====================================================
        // EXTRA EVENT
        // =====================================================
        $("#contactAlert").on("click", function () {

            $(this).fadeOut(500);

        });

    });

});
