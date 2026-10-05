/* ==========================================================================
   TechZone — directory.js
   Team Directory on about.html, backed by JSON + PHP + AJAX.

   about.html referenced this file but it had never been written, so the
   three buttons in the Team Directory section did nothing at all — which
   is why adding a member never saved anything.

   Endpoint: api/team.php
     GET  api/team.php          -> every member
     GET  api/team.php?id=2     -> one member
     POST api/team.php          -> add a member
   The PHP file reads POST data from $_POST, so the add request is sent
   form-encoded (jQuery's default), NOT as a JSON string.

   Page elements it drives:
     #dirAll        "Load all members" button
     #dirId/#dirOne member id box + "Get one" button
     #dirBody       the table body the rows are rendered into
     #dirMessage    status / error line
     #dir_name, #dir_role, #dir_department, #dir_email, #dir_joined, #dirAdd
                    the "Add a team member" fields and button

   Loaded after global.js on about.html.
   ========================================================================== */

(function ($) {
  'use strict';

  // Only run on a page that actually has the directory section.
  if (!$('#teamDirectory').length) { return; }

  var API = 'api/team.php';

  var $body = $('#dirBody');
  var $message = $('#dirMessage');

  /* ------------------------------------------------------------------
     Status helpers
     ------------------------------------------------------------------ */
  function showLoading(text) {
    $message.html(
      '<div class="d-flex align-items-center gap-2 text-muted">' +
        '<div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>' +
        '<span></span>' +
      '</div>'
    );
    $message.find('span').text(text);
  }

  function showSuccess(text) {
    $message.empty().append(
      $('<div class="alert alert-success mb-0"></div>')
        .append('<i class="bi bi-check-circle-fill"></i> ')
        .append($('<span></span>').text(text))
    );
  }

  function showError(text) {
    $message.empty().append(
      $('<div class="alert alert-danger mb-0"></div>')
        .append('<i class="bi bi-exclamation-triangle-fill"></i> ')
        .append($('<span></span>').text(text))
    );
  }

  /** Turn a failed request into a readable sentence. */
  function describeFailure(xhr, textStatus) {
    if (xhr.responseJSON && xhr.responseJSON.message) {
      return xhr.responseJSON.message;
    }
    if (xhr.status === 0) {
      return 'The server could not be reached. Is Apache running in XAMPP?';
    }
    if (textStatus === 'parsererror') {
      return 'The server did not return JSON. Open the site through Apache (http://localhost/TechZone/).';
    }
    return 'Server error ' + xhr.status + '.';
  }

  /* ------------------------------------------------------------------
     Rendering — one <tr> per member.
     Built with .text() so a name containing < or > cannot inject markup.
     ------------------------------------------------------------------ */
  function renderRows(members) {
    $body.empty();

    if (!members.length) {
      $body.append(
        $('<tr></tr>').append(
          $('<td colspan="7" class="text-center text-muted"></td>')
            .text('No team members to show.')
        )
      );
      return;
    }

    $.each(members, function (i, m) {
      var $row = $('<tr></tr>');

      $.each(['id', 'name', 'initials', 'role', 'department', 'email', 'joined'], function (j, key) {
        $row.append($('<td></td>').text(m[key] == null ? '' : m[key]));
      });

      $body.append($row);
    });
  }

  /* ------------------------------------------------------------------
     GET — every member
     ------------------------------------------------------------------ */
  function loadAll(statusText) {
    showLoading(statusText || 'Loading team members...');
    console.log('[AJAX] GET ' + API);

    return $.ajax({ url: API, method: 'GET', dataType: 'json' })
      .done(function (response) {
        console.log('[AJAX] Fetched team members:', response);

        if (response && response.success) {
          renderRows(response.data);
          showSuccess('Loaded ' + response.data.length + ' team member' +
                      (response.data.length === 1 ? '' : 's') + '.');
        } else {
          showError((response && response.message) || 'Could not load the team members.');
        }
      })
      .fail(function (xhr, textStatus, errorThrown) {
        console.error('[AJAX] team.php GET failed:', xhr.status, textStatus, errorThrown, xhr.responseText);
        showError(describeFailure(xhr, textStatus));
      });
  }

  /* ------------------------------------------------------------------
     GET — one member by id
     ------------------------------------------------------------------ */
  function loadOne() {
    var id = $('#dirId').val().trim();

    if (id === '') {
      showError('Enter a member ID first.');
      return;
    }

    showLoading('Looking up member ' + id + '...');
    console.log('[AJAX] GET ' + API + '?id=' + id);

    $.ajax({ url: API, method: 'GET', data: { id: id }, dataType: 'json' })
      .done(function (response) {
        console.log('[AJAX] Fetched one member:', response);

        if (response && response.success) {
          // The endpoint returns a single object here, not an array.
          renderRows([response.data]);
          showSuccess('Showing member ' + response.data.id + ' — ' + response.data.name + '.');
        } else {
          renderRows([]);
          showError((response && response.message) || 'Member not found.');
        }
      })
      .fail(function (xhr, textStatus, errorThrown) {
        console.error('[AJAX] team.php GET one failed:', xhr.status, textStatus, errorThrown, xhr.responseText);
        // A missing id answers 404 with {"message": "No member found with ID 9."}
        renderRows([]);
        showError(describeFailure(xhr, textStatus));
      });
  }

  /* ------------------------------------------------------------------
     POST — add a member, then reload the table from the server so the
     list on screen matches what was actually saved to team.json
     ------------------------------------------------------------------ */
  function addMember() {
    var $button = $('#dirAdd');

    var payload = {
      name: $('#dir_name').val().trim(),
      role: $('#dir_role').val().trim(),
      department: $('#dir_department').val().trim(),
      email: $('#dir_email').val().trim(),
      joined: $('#dir_joined').val().trim()
    };

    // Check here as well as in PHP, so an obvious mistake does not need a
    // round trip to the server to be reported.
    if (!payload.name || !payload.role || !payload.department || !payload.email) {
      showError('Please fill in the name, role, department and email.');
      return;
    }

    showLoading('Saving ' + payload.name + '...');
    $button.prop('disabled', true);

    console.log('[AJAX] POST ' + API, payload);

    // No contentType is set, so jQuery sends this form-encoded and PHP
    // picks it up in $_POST — which is what api/team.php reads.
    $.ajax({ url: API, method: 'POST', data: payload, dataType: 'json' })
      .done(function (response) {
        console.log('[AJAX] Team member saved:', response);

        if (response && response.success) {

          // Clear the form for the next entry.
          $('#dir_name, #dir_role, #dir_department, #dir_email, #dir_joined').val('');

          // Re-fetch so the table shows the stored records, including the
          // id and initials that PHP generated.
          loadAll().done(function () {
            showSuccess(response.data.name + ' added as member ' + response.data.id + '.');
          });

        } else {
          showError((response && response.message) || 'The server rejected the new member.');
        }
      })
      .fail(function (xhr, textStatus, errorThrown) {
        console.error('[AJAX] team.php POST failed:', xhr.status, textStatus, errorThrown, xhr.responseText);
        // Validation problems come back as 400 with a message to show.
        showError(describeFailure(xhr, textStatus));
      })
      .always(function () {
        $button.prop('disabled', false);
      });
  }

  /* ------------------------------------------------------------------
     Wiring
     ------------------------------------------------------------------ */
  $(function () {
    $('#dirAll').on('click', function () { loadAll(); });
    $('#dirOne').on('click', loadOne);
    $('#dirAdd').on('click', addMember);

    // Enter in the id box is the same as pressing "Get one".
    $('#dirId').on('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); loadOne(); }
    });

    // Fill the table straight away, so the section is not empty on arrival.
    loadAll();
  });

})(jQuery);
