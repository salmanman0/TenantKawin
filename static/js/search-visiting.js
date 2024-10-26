function searchTable() {
  // Ambil input pencarian dan kolom yang dipilih
  var input = document.getElementById("searchInput").value.toUpperCase();
  var filterColumn = document.getElementById("filterColumn").value;
  
  // Ambil tabel dan semua barisnya
  var table = document.getElementById("myTable");
  var tr = table.getElementsByTagName("tr");

  // Variabel untuk menghitung jumlah baris yang ditampilkan
  var count = 0;
  
  // Loop melalui semua baris tabel
  for (var i = 1; i < tr.length; i++) { // Mulai dari 1 untuk melewati header
    var tds = tr[i].getElementsByTagName("td");
    var found = false;
    
    // Jika filter "all" dipilih, cari di semua kolom
    if (filterColumn === "all") {
      for (var j = 0; j < tds.length; j++) {
        var td = tds[j];
        if (td) {
          var select = td.querySelector('select');
          var txtValue = select ? select.options[select.selectedIndex].text : td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(input) > -1) {
            found = true;
            break;
          }
        }
      }
    } else {
      // Jika kolom tertentu dipilih, cari di kolom tersebut saja
      var colIndex = parseInt(filterColumn);
      var td = tds[colIndex];
      if (td) {
        var select = td.querySelector('select');
        var txtValue = select ? select.options[select.selectedIndex].text : td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(input) > -1) {
          found = true;
        }
      }
    }

    // Tampilkan atau sembunyikan baris berdasarkan hasil pencarian
    tr[i].style.display = found ? "" : "none";
    
    // Hitung baris yang ditampilkan
    if (found) {
      count++;
    }
  }

  // Tampilkan total jumlah baris yang terlihat
  document.getElementById("rowCount").innerText = "Total Data: " + count;
}

// Jalankan fungsi pencarian saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  searchTable();  // Menampilkan total data saat halaman pertama kali dimuat
});