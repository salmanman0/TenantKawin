    var totalSph;
    var totalTenants;
    var totalDeal;
    var totalNego;

    function searchTable() {
      // Declare variables
      var input, filter, table, tr, td, i, j, txtValue, count;
      input = document.getElementById("searchInput");
      filter = input.value.toUpperCase();
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");
      count = 0; // Initialize count of visible rows
      var filterColumn = document.getElementById("filterColumn").value; // Get selected filter column

      // Loop through all table rows and hide those that don't match the search query
      for (i = 1; i < tr.length; i++) { // Start from 1 to skip the header row
        tr[i].style.display = "none"; // Hide row initially
        td = tr[i].getElementsByTagName("td");
        if (filterColumn === "all") { // Search all columns
          for (j = 0; j < td.length; j++) {
            if (td[j]) {
              txtValue = td[j].textContent || td[j].innerText;
              if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = ""; // Show row if match is found
                count++; // Increment count of visible rows
                break; // No need to check other cells in the same row
              }
            }
          }
        } else { // Search specific column
          var colIndex = parseInt(filterColumn);
          if (td[colIndex]) {
            txtValue = td[colIndex].textContent || td[colIndex].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
              tr[i].style.display = ""; // Show row if match is found
              count++; // Increment count of visible rows
            }
          }
        }
      }
      document.getElementById("rowCount").innerText = "Total Rows: " + count;
      updateKawinSummary();
      updateTenantTotal();
      updateSphTotal();
      updateNoDealTotal();
      updateNegoTotal();
      updateDealTotal();
    }

    function updateKawinSummary() {
      var table, tr, td, kawins = {};
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");

      for (var i = 1; i < tr.length; i++) { 
        if (tr[i].style.display !== "none") { 
          td = tr[i].getElementsByTagName("td");
          var am = td[1].textContent.trim() || td[1].innerText.trim(); 
          var kawinName = td[2].textContent.trim() || td[2].innerText.trim(); 

          if (am === '-' || am === '' || am === 'nan' || kawinName === '-' || kawinName === '' || kawinName === 'nan') {
            continue;
          }

          if (!kawins[am]) {
            kawins[am] = {};
          }

          if (kawins[am][kawinName]) {
            kawins[am][kawinName]++;
          } else {
            kawins[am][kawinName] = 1;
          }
        }
      }

      // Update the "Jumlah Tenant" section
      var tenantList = document.querySelector(".card-body ul");
      tenantList.innerHTML = ''; // Clear existing list

      for (var am in kawins) {
        for (var kawin in kawins[am]) {
          var li = document.createElement("li");
          li.className = "d-flex mb-4 pb-1";
          li.innerHTML = `
            <div class="avatar flex-shrink-0 me-3">
              <img src="../static/assets/img/icons/unicons/chart.png" alt="User" class="rounded" />
            </div>
            <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
              <div class="me-2">
                <small class="text-muted d-block mb-1">${am}</small>
                <h6 class="mb-0">${kawin}</h6>
              </div>
              <div class="user-progress d-flex align-items-center gap-1">
                <h6 class="mb-0">${kawins[am][kawin]} <span class="text-muted">Tenant</span></h6>
                
              </div>
            </div>`;
          tenantList.appendChild(li);
        }
      }
    }

    function updateTenantTotal() {
      var table, tr, td;
      var tenants = {};
      totalTenants = 0;
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");

      for (var i = 1; i < tr.length; i++) {
        if (tr[i].style.display !== "none") {
          td = tr[i].getElementsByTagName("td");
          var tenantName = td[3].textContent.trim() || td[3].innerText.trim();
          if (tenantName === '-' || tenantName === ''|| tenantName === 'nan' || tenantName === 'NaN' ) {
            continue;
          }
          if (tenants[tenantName]) {
            tenants[tenantName]++;
          } else {
            tenants[tenantName] = 1;
          }
        }
      }
      for (var tenant in tenants) {
        totalTenants += tenants[tenant];
      }
    }
    function updateNoDealTotal() {
      var table, tr, td;
      var noDeals = {};
      totalNoDeal = 0;
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");

      for (var i = 1; i < tr.length; i++) {
        if (tr[i].style.display !== "none") {
          td = tr[i].getElementsByTagName("td");
          var noDealValue = td[7].textContent.trim() || td[7].innerText.trim();
          if (noDealValue != 'NO DEAL') {
            continue;
          }
          if (noDeals[noDealValue]) {
            noDeals[noDealValue]++;
          } else {
            noDeals[noDealValue] = 1;
          }
        }
      }
      for (var noDeal in noDeals) {
        totalNoDeal += noDeals[noDeal];
      }
      var totalNoDealElement = document.querySelector("#total-noDeal");
      var totalNoDealPersenElement = document.querySelector("#total-noDeal-persen");
      if (totalNoDealElement && totalNoDealPersenElement) {
        totalNoDealElement.textContent = totalNoDeal;
        totalNoDealPersenElement.textContent = (totalNoDeal / totalTenants * 100).toFixed(2) + '%';
      }
    }
    function updateSphTotal() {
      var table, tr, td;
      var sphs = {};
      totalSph = 0;
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");

      for (var i = 1; i < tr.length; i++) {
        if (tr[i].style.display !== "none") {
          td = tr[i].getElementsByTagName("td");
          var sphValue = td[6].textContent.trim() || td[6].innerText.trim();
          if (sphValue != 'SPH') {
            continue;
          }
          if (sphs[sphValue]) {
            sphs[sphValue]++;
          } else {
            sphs[sphValue] = 1;
          }
        }
      }
      for (var sph in sphs) {
        totalSph += sphs[sph];
      }
      var totalSphElement = document.querySelector("#total-sph");
      var totalSphPersenElement = document.querySelector("#total-sph-persen");
      if (totalSphElement && totalSphPersenElement) {
        totalSphElement.textContent = totalSph;
        totalSphPersenElement.textContent = (totalSph / totalTenants * 100).toFixed(2) + '%';
      }
    }

    function updateNegoTotal() {
      var table, tr, td;
      var negos = {};
      totalNego = 0;
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");

      for (var i = 1; i < tr.length; i++) {
        if (tr[i].style.display !== "none") {
          td = tr[i].getElementsByTagName("td");
          var negoValue = td[7].textContent.trim() || td[7].innerText.trim();
          if (negoValue != 'NEGO') {
            continue;
          }
          if (negos[negoValue]) {
            negos[negoValue]++;
          } else {
            negos[negoValue] = 1;
          }
        }
      }
      for (var nego in negos) {
        totalNego += negos[nego];
      }
      var totalNegoElement = document.querySelector("#total-nego");
      var totalNegoPersenElement = document.querySelector("#total-nego-persen");
      if (totalNegoElement && totalNegoPersenElement) {
        totalNegoElement.textContent = totalNego;
        totalNegoPersenElement.textContent = (totalNego / totalSph * 100).toFixed(2) + '%';
      }
    }

    function updateDealTotal() {
      var table, tr, td;
      var deals = {};
      totalDeal = 0;
      table = document.getElementById("myTable");
      tr = table.getElementsByTagName("tr");

      for (var i = 1; i < tr.length; i++) {
        if (tr[i].style.display !== "none") {
          td = tr[i].getElementsByTagName("td");
          var dealValue = td[7].textContent.trim() || td[7].innerText.trim();
          if (dealValue != 'DEAL') {
            continue;
          }
          if (deals[dealValue]) {
            deals[dealValue]++;
          } else {
            deals[dealValue] = 1;
          }
        }
      }
      for (var deal in deals) {
        totalDeal += deals[deal];
      }
      var totalDealElement = document.querySelector("#total-deal");
      var totalDealPersenElement = document.querySelector("#total-deal-persen");
      if (totalDealElement && totalDealPersenElement) {
        totalDealElement.textContent = totalDeal;
        totalDealPersenElement.textContent = (totalDeal / totalSph * 100).toFixed(2) + '%';
      }
    }
    // Initialize the row count and tenant summary when the page loads
    document.addEventListener("DOMContentLoaded", function () {
      searchTable(); // Call the function to count total rows and update tenant summary when the page loads
    });