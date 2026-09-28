/* Class Task 5 - Team Directory: jQuery AJAX talking to api/team.php (JSON file storage) */
$(document).ready(function () {

  var API = 'api/team.php';
  var $body = $('#dirBody');
  var $msg  = $('#dirMessage');

  function showMessage(type, text) {
    $msg.html('<div class="alert alert-' + type + ' mb-0"></div>');
    $msg.find('.alert').text(text);
  }

  function rowHtml(m) {
    var $tr = $('<tr>');
    $.each([m.id, m.name, m.initials, m.role, m.department, m.email, m.joined], function (_, v) {
      $('<td>').text(v).appendTo($tr);   // .text() escapes any HTML typed by users
    });
    return $tr;
  }

  function errorText(xhr) {
    if (xhr.responseJSON && xhr.responseJSON.message) { return xhr.responseJSON.message; }
    return 'Could not reach the server. Run the site through PHP (e.g. XAMPP), not by opening the file directly.';
  }

  // READ ALL
  function loadAll(quiet) {
    $.ajax({ url: API, method: 'GET', dataType: 'json' })
      .done(function (res) {
        $body.empty();
        $.each(res.data, function (_, m) { $body.append(rowHtml(m)); });
        if (quiet !== true) { showMessage('success', 'Loaded ' + res.data.length + ' team members.'); }
      })
      .fail(function (xhr) { showMessage('danger', errorText(xhr)); });
  }

  // READ ONE
  function loadOne() {
    var id = $.trim($('#dirId').val());
    if (id === '' || parseInt(id, 10) < 1) {
      showMessage('warning', 'Enter a member ID (1 or higher).');
      return;
    }
    $.ajax({ url: API, method: 'GET', data: { id: id }, dataType: 'json' })
      .done(function (res) {
        $body.empty().append(rowHtml(res.data));
        showMessage('success', 'Showing member #' + res.data.id + '.');
      })
      .fail(function (xhr) { showMessage('danger', errorText(xhr)); });
  }

  // ADD (POST)
  function addMember() {
    var payload = {
      name:       $.trim($('#dir_name').val()),
      role:       $.trim($('#dir_role').val()),
      department: $.trim($('#dir_department').val()),
      email:      $.trim($('#dir_email').val()),
      joined:     $.trim($('#dir_joined').val())
    };
    $.ajax({ url: API, method: 'POST', data: payload, dataType: 'json' })
      .done(function (res) {
        $('#dirAddForm input').val('');
        showMessage('success', res.data.name + ' was added (ID ' + res.data.id + ').');
        loadAll(true);                    // refresh the table from the updated JSON file
      })
      .fail(function (xhr) { showMessage('danger', errorText(xhr)); });
  }
  $('#dirAll').on('click', function () { loadAll(); });
  $('#dirOne').on('click', loadOne);
  $('#dirAdd').on('click', addMember);
  $('#dirId').on('keydown', function (e) { if (e.key === 'Enter') { loadOne(); } });

  loadAll(true);   // show the table as soon as the page opens
});