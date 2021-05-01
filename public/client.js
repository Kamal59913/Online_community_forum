var socket = io();

function setUsername() {
    var us = document.getElementById('name').value
    socket.emit('setUsername', { please: us });
    //socket.emit('setUsername', document.getElementById('name').value);
};
var user;

socket.on('userSet', function(data) {
    user = data.please;
    //     document.body.innerHTML = '<input type = "text" id = "message">\
    //  <button type = "button" name = "button" onclick = "sendMessage()">Send</button>\
    //  <div id = "message-container"></div>\
    // <h1> </h1>';
    document.getElementById('message-container').innerHTML += '<div> <div class="wrapper"> <b><h6 class="user">'
        //data.please + '</h6></b></div></div>'
});

//function sendMessage() {
//   var msg = document.getElementById('message').value;
//  if (msg) {
//    socket.emit('msg', {
//        message: msg,
//       user: user
//    });
// }
///}
//socket.on('newmsg', function(data) {
//  if (user) {
//     var elm = document.getElementById('message-container');
//     var newElement = document.createElement('div');
//     let markup = `
//     <h5>${data.username}</h5>
//     <h5>${data.message}</h5>
//     newElement.innerHTML = markup
//     elm.appendChild(newElement);​​​​​​​​​​​​​​​​
//without deleting the previous texts
//    document.getElementById('message-container').innerHTML += '<div> <div class="wrapper"> <b><h6 class="user">' +
//         data.user + '</h6></b><p class="message">' + data.message + '</p></div></div>'
//   }
//})