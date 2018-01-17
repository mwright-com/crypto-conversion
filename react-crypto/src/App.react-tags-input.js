const Countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Anguilla"
]; 


import React, { Component } from 'react';
import './App.css';
import './reactTags.css';
import axios from 'axios';
import ReactDOM from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';

var NumberFormat = require('react-number-format');

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cryptos: [],
      tags: [{ id: 1, text: "Thailand" }, { id: 2, text: "India" }],
      suggestions: Countries
    }
  };

  componentDidMount() {
    var coinSymbols = "BTC,ETH,XLM";

    axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XLM&tsyms=USD')
      .then(res => {
        var converted = {};
        const cryptos = res.data;
        console.log('App.js:22 cryptos',cryptos);

        for ( var key in cryptos ) {
          converted[key] = { 
            quantity:   1,
            ratio:      cryptos[key].USD,
            dollars:    cryptos[key].USD
          }
        }

        this.setState({
          cryptos: cryptos,
          converted: converted,
          coinSymbols: coinSymbols
        });

        console.log('App.js:39 this.state.coinSymbols',this.state.coinSymbols);

      });

  };

  changeCrypto(key, e){      

    if ( e !== undefined ) {
      const converted = this.state.converted;
      converted[key] = {
          quantity:   e.target.value,
          ratio:      this.state.converted[key].ratio,
          dollars:    this.state.converted[key].ratio * e.target.value
      };

      this.setState({
        converted,
      });
      return;
    }
    return false;
  };

  changeDollar(key, e){      

    if ( e !== undefined ) {
      const converted = this.state.converted;

      // Remove dollar formatting
      const numericDollar = 0; 
      numericDollar = parseFloat(e.target.value.replace("$","").replace(/,/g,"")).toFixed(10);
      console.log('App.js:66 numericDollar',numericDollar);

      converted[key] = {
          quantity:   (1/this.state.converted[key].ratio) * numericDollar,
          ratio:      this.state.converted[key].ratio,
          dollars:    e.target.value
      };
      console.log('App.js:70 2.converted',converted);

      this.setState({
        converted,
      });
      return;
    }
    return false;
  };

  handleDelete(i) {
    let tags = this.state.tags;
    tags.splice(i, 1);
    this.setState({tags: tags});
  }

  handleAddition(tag) {
    let tags = this.state.tags;
    tags.push({
        id: tags.length + 1,
        text: tag
    });
    this.setState({tags: tags});
  }

  handleDrag(tag, currPos, newPos) {
    let tags = this.state.tags;

    // mutate array 
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    // re-render 
    this.setState({ tags: tags });
  }


  render() {

  const { tags, suggestions } = this.state;
  console.log('App.js:134 this.state',this.state);
  window.state = this.state; // for console debugging only
  return (

      <div className="App">
        <div class="text-center">
            <ReactTags tags={tags}
                suggestions={suggestions}
                handleDelete={this.handleDelete}
                handleAddition={this.handleAddition}
                handleDrag={this.handleDrag} />
        </div>

        <div id="coinSymbols">
          List your coin/token symbols (comma, separated)<br />
          <input type="text" name="coinSymbols" size="100" defaultValue={this.state.coinSymbols} /> 
          <a href="#" class="button">Update Coin List</a><br />
        </div>

        {Object.keys(this.state.cryptos).map((key) => (
          <div id="crypto-container">
            <div class="conversion-rate">1 {key} equals&nbsp;
              <NumberFormat
                value={this.state.cryptos[key].USD} 
                displayType="text"
                thousandSeparator={true} 
                prefix={'$'}
                /> USD
            </div>
            <span className="left">
              <input type="number" 
                defaultValue={1} 
                decimalscale="true"
                decimalprecision={10}
                min=".0000000001"
                value={this.state.converted[key].quantity} 
                onChange={this.changeCrypto.bind(this,key)}/> {key}
            </span>
            <span className="right">
              <NumberFormat 
                value={this.state.converted[key].dollars} 
                decimalscale="true"
                decimalprecision={3} 
                min=".0000000001"
                thousandSeparator={true} 
                prefix={'$'}
                onChange={this.changeDollar.bind(this,key)} /> USD
            </span>
          </div>
        ))}
      </div>
    )
  };
}

export default App;
