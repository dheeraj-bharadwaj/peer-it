function renderPage() {
  var roomName = document.getElementById("rname").value;
  var userName = document.getElementById("uname").value;

  if (roomName && userName) {
    // change URL, append RHS value to existing route
    window.location = `${roomName}-${userName}`;
  }
}
