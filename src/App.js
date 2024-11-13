import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import BlockLuckyABI from './BlockLuckyABI.json';

const contractAddress = '0xB416B1B313074799Ef8c69141Ab314b6Dd0AE2F2';

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [message, setMessage] = useState('');
  const [participantsCount, setParticipantsCount] = useState(0);
  const [account, setAccount] = useState(null);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Provider = new BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          const signer = await web3Provider.getSigner();
          const blockLuckyContract = new Contract(contractAddress, BlockLuckyABI, signer);
          setContract(blockLuckyContract);

          const accounts = await web3Provider.listAccounts();
          setAccount(accounts[0].address);

          const managerAddress = await blockLuckyContract.manager();
          setIsManager(managerAddress.toLowerCase() === accounts[0].address.toLowerCase());
        } catch (err) {
          console.error("Erreur lors de la connexion à Metamask :", err);
        }
      } else {
        alert('Veuillez installer Metamask pour utiliser cette DApp.');
      }
    };
    init();
  }, []);

  const joinLottery = async () => {
    try {
      const tx = await contract.joinLottery({ value: ethers.parseEther('0.001') });
      await tx.wait();
      setMessage('Vous avez rejoint la loterie avec succès !');
      getParticipantsCount();
    } catch (error) {
      setMessage('Erreur : ' + error.message);
    }
  };

  const getParticipantsCount = async () => {
    try {
      const count = await contract.getParticipantsCount();
      setParticipantsCount(count.toNumber());
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de participants:', error);
    }
  };

  const pickWinner = async () => {
    try {
      const tx = await contract.pickWinner();
      await tx.wait();
      setMessage('Un gagnant a été sélectionné !');
    } catch (error) {
      setMessage('Erreur : ' + error.message);
    }
  };

  return (
    <div>
      <h1>BlockLucky Lottery</h1>
      <button onClick={joinLottery}>Join Lottery (0.001 ether)</button>
      <button onClick={getParticipantsCount}>Get Participants Count</button>
      <p>Nombre de participants : {participantsCount}</p>
      {isManager && (
        <button onClick={pickWinner}>Pick Winner (Manager Only)</button>
      )}
      <p>{message}</p>
    </div>
  );
}

export default App;
