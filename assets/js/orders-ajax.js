/* ==========================================================================
   TechZone — orders-ajax.js   (Class Task 5: JSON + AJAX + PHP)   by Latisha

   This is the REAL, INTEGRATED version. It is not a separate demo box — it
   powers the real "Recent Orders" table on the Account Dashboard:

     * READ ALL : when the dashboard opens, AJAX loads every order from the
                  server (orders.php, which reads data/orders.json) straight
                  into the real Recent Orders table.
     * READ ONE : the "Find order" box, and the "View" button on each row,
                  ask the server for one order and show its details.
     * ADD NEW  : the "Add order" box sends a new order to the server (POST),
                  which saves it into the JSON file, then the table refreshes.

   AJAX = the page talks to the server quietly in the background (no reload).
   We use jQuery's $.ajax() for it.

   SAFETY: if the PHP server is not running (e.g. opened without XAMPP), the
   dashboard still shows its normal offline rows — nothing breaks.
   ========================================================================== */

$(function () {

  var API = "../api/orders.php";   // our PHP server file

  // Pick a Bootstrap badge colour for each status word.
  function statusClass(s) {
    if (s === "Delivered") return "bg-success";
    if (s === "Shipped")   return "bg-info";
    if (s === "Processing") return "bg-warning text-dark";
    return "bg-secondary";
  }

  // Show money nicely. Use the site's helper if it exists, else a simple format.
  function money(n) {
    if (window.TZ && TZ.formatPrice) { return TZ.formatPrice(n); }
    return "Rs. " + Number(n).toLocaleString();
  }

  // Turn a list of server orders into rows for the REAL Recent Orders table.
  function renderIntoRealTable(orders) {
    var newest = orders.slice().reverse().slice(0, 8);   // show newest first
    var rows = newest.map(function (o) {
      return "<tr>" +
        '<td class="ord-no">' + o.orderId + "</td>" +
        "<td>" + o.date + "</td>" +
        '<td class="text-center">' + o.items + "</td>" +
        '<td class="text-end">' + money(o.total) + "</td>" +
        '<td class="text-center"><span class="badge ' + statusClass(o.status) + '">' + o.status + "</span></td>" +
        '<td class="text-end"><button type="button" class="btn btn-sm btn-tz-light ajax-view" data-id="' + o.orderId + '">View</button></td>' +
      "</tr>";
    }).join("");
    $("#ordersBody").html(rows);          // fill the REAL table
  }

  /* -------- 1) READ ALL: load every order from the server -------- */
  function loadAll() {
    $.ajax({
      url: API, method: "GET", dataType: "json",
      success: function (data) {
        if (data && data.length) { renderIntoRealTable(data); }
      },
      error: function () {
        // Server off -> leave the offline rows that profile.js already drew.
        $("#ajaxNote").html('<small class="text-muted">Showing offline sample orders (start XAMPP to load from the server).</small>');
      }
    });
  }

  /* -------- 2) READ ONE: show a single order's details -------- */
  function findOne(id) {
    if (!id) { return; }
    $.ajax({
      url: API + "?id=" + encodeURIComponent(id), method: "GET", dataType: "json",
      success: function (o) {
        if (o.error) {
          $("#oneOrderResult").html('<div class="alert alert-warning mb-0">' + o.error + "</div>");
        } else {
          $("#oneOrderResult").html(
            '<div class="alert alert-info mb-0"><strong>' + o.orderId + "</strong> — " +
            o.customer + " · " + o.items + " item(s) · " + money(o.total) +
            " · " + o.payment + " · <strong>" + o.status + "</strong></div>");
        }
      },
      error: function () {
        $("#oneOrderResult").html('<div class="alert alert-danger mb-0">Could not reach the server.</div>');
      }
    });
  }
  // The Find button:
  $("#findOrderBtn").on("click", function () { findOne($("#findOrderInput").val().trim()); });
  // The "View" button on any row (works for rows added later too):
  $("#ordersBody").on("click", ".ajax-view", function () { findOne($(this).data("id")); });

  /* -------- 3) ADD NEW: save a new order to the JSON file -------- */
  $("#addOrderForm").on("submit", function (e) {
    e.preventDefault();
    var newOrder = {
      customer: $("#newCustomer").val(),
      items:    $("#newItems").val(),
      total:    $("#newTotal").val(),
      payment:  $("#newPayment").val() || "Card"
    };
    $.ajax({
      url: API, method: "POST",
      data: JSON.stringify(newOrder), contentType: "application/json", dataType: "json",
      success: function (res) {
        $("#addResult").html('<div class="alert alert-success mb-0">Saved! New order ' +
          res.order.orderId + " was added to the JSON file.</div>");
        $("#addOrderForm")[0].reset();
        loadAll();                         // refresh the real table so you see it
      },
      error: function () {
        $("#addResult").html('<div class="alert alert-danger mb-0">Could not save. Is XAMPP running?</div>');
      }
    });
  });

  // When the dashboard opens, load the orders from the server into the real table.
  loadAll();

});
