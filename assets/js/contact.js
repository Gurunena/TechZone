document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('contactForm');
    const alertBox = document.getElementById('contactAlert');

    if (!form) {
        return;
    }

    // =====================================================
    // AJAX HELPER - POSTs one message to api/messages.php
    // The PHP file reads its body with php://input, so the data is sent
    // as a JSON string with contentType 'application/json'.
    // Status messages go into the #formMessage div that is already in
    // contact.html.
    // =====================================================
    function saveMessage(payload) {

        const $status = $("#formMessage");

        $status.html(
            '<div class="d-flex align-items-center gap-2 text-muted">' +
                '<div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>' +
                '<span>Saving your message...</span>' +
            '</div>'
        );

        console.log('[AJAX] POST api/messages.php', payload);

        $.ajax({
            url: 'api/messages.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            dataType: 'json'
        })
            .done(function (response) {

                // messages.php returns HTTP 200 even when it rejects the
                // data (e.g. a missing field), so the "success" flag in the
                // response is what actually has to be checked here.
                if (response && response.success) {

                    console.log('[AJAX] Message saved:', response);

                    $status.html(
                        '<div class="alert alert-success mb-0">' +
                            '<i class="bi bi-check-circle-fill"></i> Saved to the server as message #' +
                            response.data.id +
                        '</div>'
                    );

                } else {

                    const reason = (response && response.message) || 'The server rejected the message.';
                    console.error('[AJAX] Message not saved:', response);
                    showSaveError(reason);
                }
            })
            .fail(function (xhr, textStatus, errorThrown) {

                console.error('[AJAX] api/messages.php failed:', xhr.status, textStatus, errorThrown, xhr.responseText);

                let reason;
                if (xhr.status === 0) {
                    reason = 'The server could not be reached. Is Apache running in XAMPP?';
                } else if (textStatus === 'parsererror') {
                    reason = 'The server did not return JSON. Open the site through Apache (http://localhost/TechZone/).';
                } else {
                    reason = 'Server error ' + xhr.status + '.';
                }

                showSaveError(reason);
            });
    }

    /** The message was shown but not stored - say so instead of pretending. */
    function showSaveError(reason) {

        $("#formMessage").html(
            '<div class="alert alert-danger mb-0">' +
                '<i class="bi bi-exclamation-triangle-fill"></i> <strong>Not saved.</strong> ' +
                $('<span>').text(reason).html() +
            '</div>'
        );

        // Correct the green "submitted successfully" note, so it cannot
        // claim the message went through when it did not.
        $("#jqueryMessage")
            .removeClass('alert-success')
            .addClass('alert-warning')
            .text('Your message was not saved - please try again.');
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

                // Collect every field BEFORE form.reset() wipes them, so the
                // AJAX request below still has the values to send.
                // The inquiry type uses the option's TEXT ("Warranty Inquiry")
                // rather than .val() (which would be "1"), so the JSON file
                // stays readable.
                const payload = {
                    fullName: name,
                    email: $("#email").val().trim(),
                    inquiryType: $("#inquiryType option:selected").text().trim(),
                    message: $("#message").val().trim()
                };

                // Dynamically add message
                $("#jqueryMessage").remove();

                $("#contactForm").after(
                    '<div id="jqueryMessage" class="alert alert-success mt-3">' +
                    'Thank you, ' + name + '! Your message has been submitted successfully.' +
                    '</div>'
                );

                // Reset form
                form.reset();

                // =============================================
                // SAVE TO THE SERVER (JSON + PHP + AJAX)
                // Sends the message to api/messages.php, which appends it
                // to data/messages.json. Without this the form only showed
                // a success message and nothing was ever stored.
                // =============================================
                saveMessage(payload);

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
