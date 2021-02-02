var roomName = prompt("Enter room Name:");

var userName = prompt("Enter user name:");

if(roomName && userName) {
  // change URL, append RHS value to existing route
  window.location = `${roomName}-${userName}`;
}
