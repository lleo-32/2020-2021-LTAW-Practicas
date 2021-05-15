//-- Servidor 

const http = require('http');
const fs = require('fs');
const PUERTO = 9000;

//-- Definir los tipos de mime
const mime_type = {
  "html" : "text/html",
  "css"  : "text/css",
  "js"   : "application/javascript",
  "jpg"  : "image/jpg",
  "JPG"  : "image/jpg",
  "jpeg" : "image/jpeg",
  "png"  : "image/png",
  "gif"  : "image/gif",
  "ico"  : "image/x-icon",
  "json" : "application/json",
  "TTF"  : "font/ttf"
};


//-- Cargar la pagina principal 
const INICIO = fs.readFileSync('inicio.html', 'utf-8');

//-- Cargar pagina de error
const ERROR = fs.readFileSync('error-page.html', 'utf-8');

//-- Cargar las paginas de los productos
const PRODUCTO1 = fs.readFileSync('producto1.html', 'utf-8');
const PRODUCTO2 = fs.readFileSync('producto2.html', 'utf-8');
const PRODUCTO3 = fs.readFileSync('producto3.html', 'utf-8');
const PRODUCTO4 = fs.readFileSync('producto4.html', 'utf-8');
const PRODUCTO5 = fs.readFileSync('producto5.html', 'utf-8');
const PRODUCTO6 = fs.readFileSync('producto6.html', 'utf-8');


//-- Cargar la pagina del carrito
const CARRITO = fs.readFileSync('carrito.html','utf-8');

let carrito_existe = false;
let busqueda;

//-- Cargar pagina web del formulario 
const FORMULARIO_LOGIN = fs.readFileSync('login.html','utf-8');
const FORMULARIO_PEDIDO = fs.readFileSync('pedido.html','utf-8');

//-- Cargar las paginas de respuesta
const LOGIN_OK = fs.readFileSync('login-ok.html','utf-8');
const LOGIN_KO = fs.readFileSync('login-ko.html','utf-8');
const PEDIDO_OK = fs.readFileSync('pedido-ok.html','utf-8');
const ADD_OK = fs.readFileSync('add-ok.html','utf-8');

//-- Fichero JSON
const FICHERO_JSON = "tienda.json";
const FICHERO_JSON_PRUEBA = "tienda_prueba.json";

//-- Leer el fichero JSON 
const  tienda_json = fs.readFileSync(FICHERO_JSON);

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//-- Crear lista de usuarios registrados.
let users_reg = [];
console.log("Lista de usuarios registrados");
console.log("-----------------------------");
tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.user);
    users_reg.push(element.user);
  });
console.log();

//-- Crear lista de productos disponibles.
let productos_disp = [];
let product_list = [];
console.log("Lista de productos disponibles");
console.log("-----------------------------");
tienda[0]["productos"].forEach((element, index)=>{
  console.log("Producto " + (index + 1) + ": " + element.nombre +
              ", Stock: " + element.stock + ", Precio: " + element.precio 
              + ", Descuento: " + element.descuento);
  productos_disp.push([element.nombre, element.descripcion, element.stock, 
                       element.precio, element.descuento]);
  product_list.push(element.nombre);
});
console.log();

//-- Analizar la cookie y devolver el nombre de usuario si existe,
//-- null en caso contrario.
function get_user(req) {
  
  //-- Leer la cookie recibida
  const cookie = req.headers.cookie;

  //-- Si hay cookie, guardamos el usuario
  if (cookie) {
    //-- Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //-- Variable para guardar el usuario
    let user;

    //-- Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //-- Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //-- Leer el usuario solo si nombre = user
      if (nombre.trim() === 'user') {
        user = valor;
      }
    });

    //-- si user no esta asignada se devuelve null
    return user || null;
  }
}

//-- Funcion para crear las cookies al añadir articulos al carrito.
function add_al_carrito(req, res, producto) {
  const cookie = req.headers.cookie;

  if (cookie) {
    //-- Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //-- Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //-- Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //-- Si nombre = carrito enviamos cookie de respuesta
      if (nombre.trim() === 'carrito') {
        res.setHeader('Set-Cookie', element + ':' + producto);
      }
    });
  }
}

//-- Obtener el carrito
function get_carrito(req){
  //-- Leer la cookie recibida
  const cookie = req.headers.cookie;

  if (cookie){
    //-- Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //-- Variables para guardar los datos del carrito
    let carrito;
    let carne = '';
    let num_carne = 0;
    let pollo = '';
    let num_pollo = 0;
    let potato = '';
    let num_potato = 0;
    let cham = '';
    let num_cham = 0;
    let fresa= '';
    let num_fresa = 0;
    let arandanos = '';
    let num_arandanos = 0;

    //-- Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //-- Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //-- Si nombre = carrito registramos los articulos
      if (nombre.trim() === 'carrito') {
        productos = valor.split(':');
        productos.forEach((producto) => {
          if (producto == 'carne'){
            if (num_carne == 0) {
              carne = productos_disp[0][0];
            }
            num_carne += 1;
          }else if (producto == 'pollo'){
            if (num_pollo == 0){
              pollo= productos_disp[1][0];
            }
            num_pollo += 1;
          }else if (producto == 'potato'){
            if (num_potato == 0){
              potato = productos_disp[2][0];
            }
            num_potato+= 1;
          }else if (producto == 'cham'){
            if (num_cham== 0){
              cham = productos_disp[3][0];
            }
            num_cham += 1;
          }else if (producto == 'fresa'){
            if (num_fresa == 0){
              fresa = productos_disp[4][0];
            }
            num_fresa+= 1;
          }else if (producto == 'arandanos'){
            if (num_arandanos == 0){
              arandanos = productos_disp[5][0];
            }
            num_arandanos+= 1;
          }
        });

        if (num_carne != 0) {
          carne += ' x ' + num_carne;
        }
        if (num_pollo != 0) {
          pollo += ' x ' + num_pollo;
        }
        if (num_potato != 0) {
          potato += ' x ' + num_potato;
        }
        if (num_cham != 0) {
          cham += ' x ' + num_cham;
        }
        if (num_fresa != 0) {
          fresa += ' x ' + num_fresa;
        }
        if (num_arandanos != 0) {
          arandanos += ' x ' + num_arandanos;
        }
        carrito = carne + '<br>' + pollo + '<br>' + potato + '<br>' + cham + '<br>' + fresa + '<br>' + arandanos + '<br>';
      }
    });

    //-- Si esta vacío se devuelve null
    return carrito || null;
  }
}

var n;
//-- Funcion para obtener la pagina del producto
function get_producto(n, content) {
  content = content.replace('NOMBRE', productos_disp[n][0]);
  content = content.replace('DESCRIPCION', productos_disp[n][1]);
  content = content.replace('PRECIO', productos_disp[n][3]);
  
  return content;
}

//-- Crear el SERVIDOR.
const server = http.createServer((req, res) => {

    //-- Construir el objeto url con la url de la solicitud
    const myURL = new URL(req.url, 'http://' + req.headers['host']);  
    console.log("");
    console.log("Método: " + req.method);
    console.log("Recurso: " + req.url);
    console.log("  Ruta: " + myURL.pathname);
    console.log("  Parametros: " + myURL.searchParams);

    //-- Variables para el mensaje de respuesta
    let content_type = mime_type["html"];
    let content = "";

    //-- Leer recurso y eliminar la / inicial
    let recurso = myURL.pathname;
    recurso = recurso.substr(1); 
    
    
    switch (recurso) {
      case '':
          console.log("Main page");
          //-- Por defecto pagina de inicio
          content = INICIO;

           //-- Obtener el usuario que ha accedido
          let user = get_user(req);

          //-- Si la variable user está asignada
          //-- no mostrar el acceso a login.
          if (user) {
            //-- Anadir a la página el nombre del usuario
            content = INICIO.replace("HTML_EXTRA", "<h2>Usuario: " + user + "</h2>" +
                      `<form action="/carrito" method="get"><input type="submit" value="Carrito"/></form>`);
          }else{
            //-- Mostrar el enlace al formulario Login
            content = INICIO.replace("HTML_EXTRA", 
                      `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
          }
          break;

      //-- Paginas de los distintos productos.    
      case 'producto1':
        n = 0;
        content = PRODUCTO1;
        content = get_producto(n, content);
        break;
      
      case 'producto2': 
        n = 1;
        content = PRODUCTO2;
        content = get_producto(n, content);
        break;

      case 'producto3':
        n = 2;
        content = PRODUCTO3;
        content = get_producto(n, content);
        break;

      case 'producto4': 
        n = 3;
        content = PRODUCTO4;
        content = get_producto(n, content);
        break;
      
      case 'producto5': 
        n = 4;
        content = PRODUCTO5;
        content = get_producto(n, content);
        break;

      case 'producto6': 
        n = 5;
        content = PRODUCTO6;
        content = get_producto(n, content);
        break;

      //-- Añadir al carrito los distintos productos      
      case 'add_carne':
        content = ADD_OK;
        if (carrito_existe) {
          add_al_carrito(req, res, 'carne');
        }else{
          res.setHeader('Set-Cookie', 'carrito=carne');
          carrito_existe = true;
        }
        //-- Si se esta registrado se muestra el acceso al carrito,
        //-- sino se muestra el acceso al login.
        user_registrado = get_user(req);
          if (user_registrado) {
            //-- Mostrar el enlace al formulario Login
            content = ADD_OK.replace("HTML_EXTRA", 
                      `<form action="/carrito" method="get"><input type="submit" value="Ver carrito"/></form>`);
          }else{
            //-- Mostrar el enlace al formulario Login
            content = ADD_OK.replace("HTML_EXTRA", 
                      `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
          }
        break;

      case 'add_pollo':
        content = ADD_OK;
        if (carrito_existe) {
          add_al_carrito(req, res, 'pollo');
        }else{
          res.setHeader('Set-Cookie', 'carrito=pollo');
          carrito_existe = true;
        }
        //-- Si se esta registrado se muestra el acceso al carrito,
        //-- sino se muestra el acceso al login.
        user_registrado = get_user(req);
          if (user_registrado) {
            //-- Mostrar el enlace al formulario Login
            content = ADD_OK.replace("HTML_EXTRA", 
                      `<form action="/carrito" method="get"><input type="submit" value="Ver carrito"/></form>`);
          }else{
            //-- Mostrar el enlace al formulario Login
            content = ADD_OK.replace("HTML_EXTRA", 
                      `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
          }
        break;
      
      case 'add_potato':
        content = ADD_OK;
        if (carrito_existe) {
          add_al_carrito(req, res, 'potato');
        }else{
          res.setHeader('Set-Cookie', 'carrito=potato');
          carrito_existe = true;
        }
        //-- Si se esta registrado se muestra el acceso al carrito,
        //-- sino se muestra el acceso al login.
        user_registrado = get_user(req);
          if (user_registrado) {
            //-- Mostrar el enlace al formulario Login
            content = ADD_OK.replace("HTML_EXTRA", 
                      `<form action="/carrito" method="get"><input type="submit" value="Ver carrito"/></form>`);
          }else{
            //-- Mostrar el enlace al formulario Login
            content = ADD_OK.replace("HTML_EXTRA", 
                      `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
          }
        break;

      case 'add_cham':
          content = ADD_OK;
          if (carrito_existe) {
            add_al_carrito(req, res, 'cham');
          }else{
            res.setHeader('Set-Cookie', 'carrito=cham');
            carrito_existe = true;
          }
          //-- Si se esta registrado se muestra el acceso al carrito,
          //-- sino se muestra el acceso al login.
          user_registrado = get_user(req);
            if (user_registrado) {
              //-- Mostrar el enlace al formulario Login
              content = ADD_OK.replace("HTML_EXTRA", 
                        `<form action="/carrito" method="get"><input type="submit" value="Ver carrito"/></form>`);
            }else{
              //-- Mostrar el enlace al formulario Login
              content = ADD_OK.replace("HTML_EXTRA", 
                        `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
            }
          break;

      case 'add_fresa':
            content = ADD_OK;
            if (carrito_existe) {
              add_al_carrito(req, res, 'fresa');
            }else{
              res.setHeader('Set-Cookie', 'carrito=fresa');
              carrito_existe = true;
            }
            //-- Si se esta registrado se muestra el acceso al carrito,
            //-- sino se muestra el acceso al login.
            user_registrado = get_user(req);
              if (user_registrado) {
                //-- Mostrar el enlace al formulario Login
                content = ADD_OK.replace("HTML_EXTRA", 
                          `<form action="/carrito" method="get"><input type="submit" value="Ver carrito"/></form>`);
              }else{
                //-- Mostrar el enlace al formulario Login
                content = ADD_OK.replace("HTML_EXTRA", 
                          `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
              }
            break;

      case 'add_arandanos':
              content = ADD_OK;
              if (carrito_existe) {
                add_al_carrito(req, res, 'arandanos');
              }else{
                res.setHeader('Set-Cookie', 'carrito=arandanos');
                carrito_existe = true;
              }
              //-- Si se esta registrado se muestra el acceso al carrito,
              //-- sino se muestra el acceso al login.
              user_registrado = get_user(req);
                if (user_registrado) {
                  //-- Mostrar el enlace al formulario Login
                  content = ADD_OK.replace("HTML_EXTRA", 
                            `<form action="/carrito" method="get"><input type="submit" value="Ver carrito"/></form>`);
                }else{
                  //-- Mostrar el enlace al formulario Login
                  content = ADD_OK.replace("HTML_EXTRA", 
                            `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
                }
              break;
          

       
      case 'carrito':
        content = CARRITO;
        let carrito = get_carrito(req);
        content = content.replace("PRODUCTOS", carrito);
        break;
      
      //-- Acceso al formulario Login
      case 'login':
        content = FORMULARIO_LOGIN;
        break;
      
      //-- Procesar la respuesta del formulario login
      case 'procesarlogin':
        //-- Obtener el nombre de usuario
        let usuario = myURL.searchParams.get('nombre');
        console.log('Nombre: ' + usuario);
        //-- Dar bienvenida solo a usuarios registrados.
        if (users_reg.includes(usuario)){
            console.log('El usuario esta registrado');
            //-- Asignar la cookie al usuario registrado.
            res.setHeader('Set-Cookie', "user=" + usuario);
            //-- Asignar la página web de login ok.
            content = LOGIN_OK;
            html_extra = usuario;
            content = content.replace("HTML_EXTRA", html_extra);
        }else{
            content = LOGIN_KO;
        }
        break;
      
      //-- Acceso al formulario de pedidos
      case 'pedido':
        content = FORMULARIO_PEDIDO;
        let pedido = get_carrito(req);
        content = content.replace("PRODUCTOS", pedido);
        break;
      
      //-- Procesar el formulario de pedidos
      case 'procesarpedido':
        //-- Guardar los datos del pedido en el fichero JSON
        //-- Primero obtenemos los parametros
        let direccion = myURL.searchParams.get('dirección');
        let tarjeta = myURL.searchParams.get('tarjeta');
        console.log("Dirección de envío: " + direccion + "\n" +
                    "Número de la tarjeta: " + tarjeta + "\n");
        //-- Obtener la lista de productos y la cantidad
        carro = get_carrito(req);
        producto_unidades = carro.split('<br>');
        console.log(producto_unidades);

        //-- Arrays para guardar los productos adquiridos
        let list_productos = [];
        let list_unidades = [];
        //-- Obtener numero de productos adquiridos y actualizar stock
        producto_unidades.forEach((element, index) => {
          let [producto, unidades] = element.split(' x ');
          list_productos.push(producto);
          list_unidades.push(unidades);
        });
        
        //-- Actualizar en la base de datos el stock de los productos.
        tienda[0]["productos"].forEach((element, index)=>{
          console.log("Producto " + (index + 1) + ": " + element.nombre);
          console.log(list_productos[index]);
          console.log();
          if (element.nombre == list_productos[index]){
            element.stock = element.stock - list_unidades[index];
          }
        });
        console.log();
        
        //-- Guardar datos del pedido en el registro tienda.json
        //-- si este no es nulo (null)
        if ((direccion != null) && (tarjeta != null)) {
          let pedido = {
            "user": get_user(req),
            "dirección": direccion,
            "tarjeta": tarjeta,
            "productos": producto_unidades
          }
          tienda[2]["pedidos"].push(pedido);
          //-- Convertir a JSON y registrarlo
          let myTienda = JSON.stringify(tienda, null, 4);
          fs.writeFileSync(FICHERO_JSON_PRUEBA, myTienda);
        }
        //-- Confirmar pedido
        console.log('Pedido procesado correctamente');
        content = PEDIDO_OK;
        break;
      
      //-- Barra de búsqueda
      case 'productos':
          console.log("Peticion de Productos!")
          content_type = mime_type["json"]; 

          //-- Leer los parámetros
          let param1 = myURL.searchParams.get('param1');

          param1 = param1.toUpperCase();

          console.log("  Param: " +  param1);

          let result = [];

          for (let prod of product_list) {

              //-- Pasar a mayúsculas
              prodU = prod.toUpperCase();

              //-- Si el producto comienza por lo indicado en el parametro
              //-- meter este producto en el array de resultados
              if (prodU.startsWith(param1)) {
                  result.push(prod);
              }
              
          }
          console.log(result);
          busqueda = result;
          content = JSON.stringify(result);
          break;
        
      case 'buscar':
        if (busqueda == 'Carne') {
          n = 0;
          content = PRODUCTO1;
          content = get_producto(n, content);
        }else if(busqueda == 'Pollo'){
          n = 1;
          content = PRODUCTO2;
          content = get_producto(n, content);
        }else if(busqueda == 'Potato'){
          n = 2;
          content = PRODUCTO3;
          content = get_producto(n, content);
        }else if(busqueda == 'Cham'){
          n = 3;
          content = PRODUCTO4;
          content = get_producto(n, content);
        }else if(busqueda == 'Fresa'){
          n = 4;
          content = PRODUCTO5;
          content = get_producto(n, content);
        }else if(busqueda == 'Arandanos'){
          n = 5;
          content = PRODUCTO6;
          content = get_producto(n, content);
        }
        break;
    
        case 'cliente.js':
          //-- Leer fichero javascript
          console.log("recurso: " + recurso);
          fs.readFile(recurso, 'utf-8', (err,data) => {
              if (err) {
                  console.log("Error: " + err)
                  return;
              } else {
                res.setHeader('Content-Type', mime_type["js"]);
                res.write(data);
                res.end();
              } 
          });
          
          return;
          break;

          //-- Si no es ninguna de las anteriores devolver mensaje de error
      default:
        path = myURL.pathname.split('/');
        ext = '';
        if (path.length > 2){
            file = path[path.length-1]
            ext = file.split('.')[1]
            if(path.length == 3){
                if (path[1].startsWith('producto')){
                    recurso = file
                }else{
                    recurso = path[1] + '/' + file
                }
            }else{
                recurso = path[2] + '/' + file
            }
        }else{
            recurso = myURL.pathname.split('/')[1];
            ext = recurso.split('.')[1]
        }
        fs.readFile(recurso, (err, data) => {
        //-- Controlar si la pagina es no encontrada.
        //-- Devolver pagina de error personalizada, 404 NOT FOUND
            if (err){
            res.writeHead(404, {'Content-Type': content_type});
            res.write(ERROR_PAGE);
            res.end();
            }else{
                //-- Todo correcto
                //-- Devolvemos segun el tipo de mime
                content_type = mime_type[ext];
                res.setHeader('Content-Type', content_type);
                res.write(data);
                res.end();
            } 
        });
    return;
  }

    //-- Si hay datos en el cuerpo, se imprimen
    req.on('data', (cuerpo) => {

      //-- Los datos del cuerpo son caracteres
      req.setEncoding('utf8');
      console.log(`Cuerpo (${cuerpo.length} bytes)`)
      console.log(` ${cuerpo}`);
    });

    //-- Esto solo se ejecuta cuando llega el final del mensaje de solicitud
    req.on('end', ()=> {
      //-- Generar respuesta
      res.setHeader('Content-Type', content_type);
      res.write(content);
      res.end()
    });

});

server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);