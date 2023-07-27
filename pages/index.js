import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const atmABI = atm_abi.abi;

const AccountInfo = ({ account, balance, onDeposit, onWithdraw, isLoading }) => {
  return (
    <div>
      <p>Your Account: {account}</p>
      <p>Your Balance: {balance} ETH</p>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <button onClick={onDeposit}>Deposit 1 ETH</button>
          <button onClick={onWithdraw}>Withdraw 1 ETH</button>
        </>
      )}
    </div>
  );
};

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const getWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask wallet is required to connect");
      return;
    }
    setEthWallet(window.ethereum);

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts && accounts.length > 0) {
        handleAccount(accounts[0]);
      } else {
        console.log("No account found");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleAccount = (account) => {
    console.log("Account connected: ", account);
    setAccount(account);
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts[0]);
      // once wallet is set we can get a reference to our deployed contract
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      setIsLoading(true);
      try {
        let tx = await atm.deposit(ethers.utils.parseEther("1"));
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error depositing:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      setIsLoading(true);
      try {
        let tx = await atm.withdraw(ethers.utils.parseEther("1"));
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error withdrawing:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your MetaMask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <AccountInfo
        account={account}
        balance={balance}
        onDeposit={deposit}
        onWithdraw={withdraw}
        isLoading={isLoading}
      />
    );
  };

  useEffect(() => {
    getWallet();
    // Listen for account changes
    if (ethWallet) {
      const handleAccountChange = (accounts) => {
        if (accounts && accounts.length > 0) {
          handleAccount(accounts[0]);
        } else {
          console.log("No account found");
          setAccount(undefined);
        }
      };
      ethWallet.on("accountsChanged", handleAccountChange);
      return () => {
        ethWallet.off("accountsChanged", handleAccountChange);
      };
    }
  }, [ethWallet]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
