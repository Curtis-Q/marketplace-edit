import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import Navbar from './Navbar'
import Marketplace from '../abis/Marketplace.json'
import Faucet from '../abis/Faucet.json'
import Main from './Main'
import './App.css';

class App extends Component {

  // SET STATE DEFAULT VALUES
  constructor(props) 
  {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true,
      ownerAccount: ['0xf3f921AcEe4E3C771810CdeAAAeD48a88F2dE9D3'],
      faucetBalance: ''
    }

    // ALLOW CALLING OF FUNCTION WITH FORM
    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
    this.shareProduct = this.shareProduct.bind(this)
    this.showContractBalance = this.showContractBalance.bind(this)
    this.donateTofaucet = this.donateTofaucet.bind(this)
  }

  async componentWillMount() 
  {
    // DETECTS PROVIDER
    await this.loadWeb3()

    // LOADS DATA FROM BLOCKCHAIN
    await this.loadBlockchainData()
  }

  // THIS FUNCTION DETECTS THE PRESENCE OF AN ETHEREUM PROVIDER IN WEB BROWSER (METAMASK)
  async loadWeb3()
  {
    if (window.ethereum)
    {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3)
    {
        window.web3 = new Web3(window.web3.currentProvider)
    }
    else
    {
      window.alert('Non eth browser detected')
    }
  }

  // LOADS DATA FROM BLOCKCHAIN
  async loadBlockchainData()
  {
    const web3 = window.web3

    // RETRIEVES ACCOUNT AND SAVES IT TO STATE
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0]})

    // CONNECT TO SMART CONTRACT
    // READS THE NETWORK ID TO DETERMINE WHICH NETWORK WE ARE CONNECTED TO WITH METAMASK (GANACHE FOR EXAMPLE)
    const networkId = await web3.eth.net.getId()

    // USE THE NETWORK ID TO CONNECT TO THE SMART CONTRACT DEPLOYED TO THE GANACHE NETWORK (RATHER THAN ETHEREUM NETWORK)
    const networkData = Marketplace.networks[networkId]
    const networkData2 = Faucet.networks[networkId]

    // INSTANTIATE SMART CONTRACT WITH WEB3.JS
    // BOTH THE SMARTCONTRACT ABI AND THE ADDRESS ARE RETRIEVED FROM import Marketplace from '../abis/Marketplace.json'
    if(networkData && networkData2)
    {
      const marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address)
      this.setState({ marketplace })

      const faucet = new web3.eth.Contract(Faucet.abi, networkData2.address)
      this.setState({ faucet })

      // FETCH ALL THE PRODUCTS FROM BLOCKCHAIN
      // LOOP OVER PRODUCTS ON MARKETPLACE AND SAVE TO STATE
      const productCount = await marketplace.methods.productCount().call()
      this.setState({ productCount })
      console.log("Product Count = " + productCount)
      for (var i=1; i<=productCount; i++)
      {
        const product = await marketplace.methods.products(i).call()
        this.setState({
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false })

    }
    else
    {
      window.alert('Marketplace contract not deployed')
    }
  }

  
  async showContractBalance()
  {
    console.log('test')
    this.setState({ loading: true })
    var getBalance = await this.state.faucet.methods.showContractBalance().call()
    console.log(getBalance)
    var newBalance = getBalance.toString()
    console.log(newBalance)
    // if (getBalance != null)
    // {
    //   this.setState({faucetBalance: getBalance})
    // }
    // else 
    // {
    //   this.setState({faucetBalance: 2})
    // }
    this.setState({faucetBalance: getBalance})
    this.setState({ loading: false })
  }

  donateTofaucet()
  {
    this.setState({ loading: true })
    this.state.faucet.methods.donateTofaucet().send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  // CREATE JAVASCRIPT FUNCTION THAT ACCEPTS SAME PARAMETERS AS CONTRACT FUNCTION
  // TELL USER THAT APP IS LOADING SO THEY KNOW FUNCTION WAS SUBMITTED
  // CALL THE SMART CONTRACT FUNCTION AND TELL WEB3 THAT THE CURRENT ACCOUNT IS THE ONE CALLING IT
  // ONCE TRANSACTION RECEIPT HAS BEEN RECEIVED, REMOVE LOADING STATE
  // TO ALLOW CALLING OF FUNCTION IN FORM, MUST BIND IN THE CONSTRUCTOR
  createProduct(name, price)
  {
    this.setState({ loading: true, ownerAccount: this.state.account })
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  // FUNCTION FOR BUYING THE PRODUCT
  // TO ALLOW CALLING OF FUNCTION IN FORM, MUST BIND IN THE CONSTRUCTOR
  // PASS TO MAIN IN THE RENDER FUNCTION BELOW
  purchaseProduct(id, price)
  {
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  shareProduct()
  {
    this.setState({ loading: true })
    this.state.faucet.methods.requestTokens().send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
            { this.state.loading
              ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
              : // THIS PASSES THE DATA TO MAIN
                <Main 
                  donateTofaucet={this.donateTofaucet}
                  showContractBalance={this.showContractBalance}
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct}
                  shareProduct={this.shareProduct}
                  faucetBalance={this.state.faucetBalance}
                   />
            }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
