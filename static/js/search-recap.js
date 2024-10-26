
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
}

document.addEventListener("DOMContentLoaded", function () {
  searchTable();
});