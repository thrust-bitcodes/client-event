/*
 * @Author: Cleverson Puche
 * @Date: 2017-08-08 09:53:37
 */

/**
 * Inicializa o servidor
 * @param {Function} onClientConnectFunction - Função de callback a ser invocada quando um cliente se conectar
 * @param {Function} onClientDisconnectFunction - Função de callback a ser invocada quando um cliente se desconectar
 * @example
 * clientEvent.start(function(socketClientIO, urlParamsObj) { }, function(socketClientIO) { })
 */
function start(onClientConnectFunction, onClientDisconnectFunction) {
  var socketIOServerInstance
  var config = getBitcodeConfig('clientevent')  

  var Configuration = Java.type('com.corundumstudio.socketio.Configuration')
  var SocketIOServer = Java.type('com.corundumstudio.socketio.SocketIOServer')
  var ConnectListener = Java.type('com.corundumstudio.socketio.listener.ConnectListener')
  var DisconnectListener = Java.type('com.corundumstudio.socketio.listener.DisconnectListener')
  var File = Java.type('java.io.File')

  var sokcetIOServerConfig = new Configuration()
  
  sokcetIOServerConfig.setPort(config.port)

  if (config.useSecureAuthentication) {
    var currentDir = new File("").getAbsolutePath()
    var fileInputStream = new java.io.FileInputStream(new File(currentDir + File.separator + config.keyStoreFileName))

    sokcetIOServerConfig.setKeyStore(fileInputStream)
    sokcetIOServerConfig.setKeyStorePassword(config.keyStorePassword)
  }

  socketIOServerInstance = new SocketIOServer(sokcetIOServerConfig)
  socketIOServerInstance.addConnectListener(new ConnectListener() {
    onConnect: function (socketClientIO) {
      if(_onClientConnect) {
        var Map = Java.type('java.util.Map')
        var urlParams = socketClientIO.getHandshakeData().getUrlParams()
        var urlParamsObj = {}

        for each (var e in urlParams.entrySet()) {
          var key = e.getKey().toString()
          var values = e.getValue()
          var valuesArr = []
          for each (var value in values) {
            valuesArr.push(value)
          }
          urlParamsObj[key] = valuesArr.length > 1 ? valuesArr : valuesArr[0]
        }
        if(onClientConnectFunction) {
          onClientConnectFunction(socketClientIO, urlParamsObj)
        }
      }
    }
  })

  socketIOServerInstance.addDisconnectListener(new DisconnectListener() {
    onDisconnect: function (socketClientIO) {
      if(onClientDisconnectFunction) {
        onClientDisconnectFunction(socketClientIO)
      }
    }
  })

  socketIOServerInstance.start()

  print('\n==============================================')
  print("ClientEvent server started at port: " + config.port)
  print('==============================================\n')

  return socketIOServerInstance
}

/**
 * Adiciona um client em uma sala
 * @param {String} roomName - Nome da sala
 * @param {Object} socketClientIO - Instância de SocketClientIO
 * @example
 * clientEvent.joinRoom("One", socketClientIO)
 */
function joinRoom(roomName, socketClientIO) {
  if(socketClientIO) {
    socketClientIO.joinRoom(roomName)
  }
}

/**
 * Remove um client de uma sala
 * @param {String} roomName - Nome da sala
 * @param {Object} socketClientIO - Instância de SocketClientIO
 * @example
 * clientEvent.leaveRoom("One", socketClientIO)
 */
function leaveRoom(roomName, socketClientIO) {
  if(socketClientIO) {
    socketClientIO.leaveRoom(roomName)
  }
}

/**
 * Devolve todos os clients registrados em uma sala
 * @param {Object} socketIOServerInstance - Instância de SocketIOServer
 * @param {String} roomName - Nome da sala
 * @example
 * var roomClients = clientEvent.getRoomClients(socketIOServerInstance, "One")
 * roomClients[0].send('privateTest',{data: 'test'})
 * @returns {Array} Retorna uma lista onde cada objeto é uma instância de SocketIOClient (o mesmo recebido nas funções onConnect e onDisconnect) presente na sala informada
 */
function getRoomClients(socketIOServerInstance, roomName) {
  if(!socketIOServerInstance) {
    return
  }

  var roomClients = []
  if (_socketIOServerInstance) {
    var roomClientsCollection = socketIOServerInstance.getRoomOperations(roomName).getClients()
    for (var ite = roomClientsCollection.iterator(); ite.hasNext();) {
      roomClients.push(ite.next())
    }
  }
  return roomClients
}

/** 
 * Devolve a instância de uma room (sala) para que operações sob a mesma possam ser feitas
 * @param {Object} socketIOServerInstance - Instância de SocketIOServer
 * @param {String} roomName - Nome da sala
 * @example
 * var roomOneInstance = clientEvent.getRoom(socketIOServerInstance, "One")
 * roomOneInstance.sendEvent('event1',{data: 'test'})
 * roomOneInstance.getClients() -> [socketIOClient]
 * @returns {Object} Retorna a instância de uma room (sala)
 */
function getRoom(socketIOServerInstance, roomName) {
  if(socketIOServerInstance) {
    return socketIOServerInstance.getRoomOperations(roomName)
  }
}

/**
 * Obtém a lista de clientes conectados
 * @param {Object} socketIOServerInstance - Instância de SocketIOServer
 * @example
 * var clients = clientEvent.getAllClients(socketIOServerInstance)
 * clients[0].send('eventTeste',{data: 'test'})
 * @returns {Array} Retorna uma lista onde cada objeto é uma instância de SocketIOClient (o mesmo recebido nas funções onConnect e onDisconnect)
*/
function getAllClients(socketIOServerInstance) {
  var allClients = []
  if (socketIOServerInstance) {
    var allClientsCollection = socketIOServerInstance.getAllClients()

    for (var ite = allClientsCollection.iterator(); ite.hasNext();) {
      allClients.push(ite.next())
    }
  }
  return allClients
}

/**
 * Obtém a lista de clientes conectados
 * @param {Object} socketIOServerInstance - Instância de SocketIOServer
 * @example
 * clientEvent.stop(socketIOServerInstance)
 * @returns {Array} Retorna uma lista onde cada objeto é uma instância de SocketIOClient (o mesmo recebido nas funções onConnect e onDisconnect)
*/
function stop(socketIOServerInstance) {
  if (socketIOServerInstance) {
    socketIOServerInstance.stop()
  }
}

exports = {
  start: start,
  joinRoom: joinRoom,
  leaveRoom: leaveRoom,
  getRoomClients: getRoomClients,
  getRoom: getRoom,
  getAllClients: getAllClients,
  stop: stop
}