//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');

//-- Puerto donde se utilizará el chat.
const PUERTO = 9000;

//-- Notificaciones del chat
const command_list = "Comandos:<br>"
                   + "/help: Muestra una lista de los comandos que puedes usar<br>"
                   + "/list: Muestra el número de usuarios conectados<br>"
                   + "/hello: El servidor devuelve un saludo<br>"
                   + "/date: El servidor devuelve la fecha actual";

const hello_msg = "¡Hola!";
const welcome_msg = "¡Bienvenido al chat!";
const bye_msg = "¡Hasta pronto!";
const newuser_msg = "Nuevo usuario en el chat";

//-- Contador de usuarios conectados
let users_count = 0;

//-- Obtener la fecha actual
const date = new Date;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  res.send('¡Bienvenido al chat!' + '<p><a href="/chat.html">Ir al chat</a></p>');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- Directorio público que contiene ficheros estáticos.
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);
  //-- Contabilizar al nuevo usuario
  users_count += 1;
  
  //-- Enviar mensaje de bienvenida al usuario.
  socket.send(welcome_msg);

  //-- Notificar al resto de usuarios que un nuevo
  //-- usuario a accedido al chat.
  //socket.broadcast.emit('message', msg_newuser);
  io.send(newuser_msg)

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    //-- Enviar mensaje de despedida al usuario.
    socket.broadcast.emit('message', bye_msg);
    //-- Actualizar el numero de usuarios conectados
    users_count -= 1;
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);

    //-- Aqui comienza el tratamiento de los comandos especiales.
    if (msg.startsWith('/')) {
      //console.log("Comando Especial".red.bold);
      switch(msg){
        case '/help':
          console.log("Mostrar lista de comandos especiales".red.bold);
          msg = command_list;
          socket.send(msg);
          break;
        case '/list':
          console.log("Mostrar número de usuarios conectados".red.bold);
          msg = users_count;
          socket.send("Hay " + msg + " usuarios conectados.");
          break;
        case '/hello':
          console.log("Obtener saludo del servidor".red.bold);
          msg = hello_msg;
          socket.send(msg);
          break;
        case '/date':
          console.log("Obtener fecha actual".red.bold);
          msg = ("La fecha actual es: " + date);
          socket.send(msg);
          break;
        default:
          console.log("comando no reconocido".red.bold);
          msg = "Comando no reconocido.";
          socket.send(msg);
          break;
      }
    } else {
      //-- Reenviarlo a todos los clientes conectados
      io.send(msg);
    }; 
  });
});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);