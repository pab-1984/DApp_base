import detectEthereumProvider from '@metamask/detect-provider';
import React, { Component } from 'react';
import Web3 from 'web3';
import WalletWallABI from '../abis/WalletWall.json';
import './App.css';

const contractAddress = '0x291cD84e4347cBbbeECa490e80EA69f74c1F9878'; // dirección del contrato

class App extends Component {
  state = {
    web3: null,
    account: null,
    message: '',
    messages: [], // Estado para almacenar los mensajes
    contract: null, // Agregar el contrato al estado
  };

  componentDidMount = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const contract = new web3.eth.Contract(WalletWallABI.abi, contractAddress);
        this.setState({ web3, account: accounts[0], contract }, () => {
          this.loadMessages();
          //this.subscribeToEvents();
        }); // Llama a loadMessages y subscribeToEvents después de establecer el estado
      } else {
        console.error('Please install MetaMask!');
      }
    } catch (error) {
      console.error(error);
    }
      // Establecer un intervalo para cargar los mensajes cada 5 segundos
    this.messagesInterval = setInterval(this.loadMessages, 5000);
  };
  componentWillUnmount() {
    // Limpiar el intervalo cuando el componente se desmonte
    clearInterval(this.messagesInterval);
  }
/*  subscribeToEvents = () => {
    const { contract } = this.state;
    if (contract) {
      contract.events.MessagePublished({
        fromBlock: 'latest'
      }, (error, event) => {
        if (error) {
          console.error("Error al escuchar eventos:", error);
        } else {
          this.loadMessages(); // Recarga los mensajes cuando se publica uno nuevo
        }
      });
    }
  };
*/
loadMessages = async () => {
  const { contract } = this.state;
  if (contract) {
    const messages = await contract.methods.getMessages().call();
    this.setState({ messages });
  }
};

  handleMessageChange = (event) => {
    this.setState({ message: event.target.value });
  };

  handlePublish = async () => {
    const { web3, account, message, contract } = this.state;
    if (contract && web3) {
      try {
        // Envía la transacción con el valor de la tarifa fija
        const response = await contract.methods.publish(message).send({
          from: account,
          value: web3.utils.toWei('0.01', 'ether') // Asegúrate de que este valor sea igual a la tarifa fija
        });
  
        console.log('Transacción enviada:', response);
  
        // Recarga los mensajes después de publicar
        await this.loadMessages();
      } catch (error) {
        console.error("Error al publicar el mensaje:", error);
      }
    }
  };

  render() {
    const { account, message, messages } = this.state;
    return (
      <div className="App">
        <div className="wall-container">
          {/* Muro donde se muestran los mensajes */}
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <div>{msg.sender}</div>
              <div>{msg.content}</div>
            </div>
          ))}
        </div>
        <div className="input-container">
          {/* Cuadro de diálogo para ingresar y publicar un nuevo mensaje */}
          {account ? (
            <div>
              <textarea
                placeholder="Escribe tu mensaje aquí"
                value={message}
                onChange={this.handleMessageChange}
              />
              <button onClick={this.handlePublish}>Publicar</button>
            </div>
          ) : (
            <p>Conecta tu billetera para publicar.</p>
          )}
        </div>
      </div>
    );
  }
}

export default App;