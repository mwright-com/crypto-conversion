
const arrCoinSymbols = [
  "BTC",
  "ETH",
  "XRP",
  "XLM"
];

import React, { Component } from 'react';
import './App.css';
import './react-tagsinput.css';
import helpers from './helpers';
import TagsInput from 'react-tagsinput';
import Autosuggest from 'react-autosuggest';
import coinListSmall from './coinlist';


var NumberFormat = require('react-number-format');
const coinListMini = coinListSmall;

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cryptos: [],
      tags: arrCoinSymbols,
      suggestions: arrCoinSymbols.join(),
      coinListSmall: coinListMini
    }

  };

  componentDidMount() {

    var coinSymbolsDefault = arrCoinSymbols.join();

    helpers.getCryptoPrices(coinSymbolsDefault)
      .then(function(data){
        // console.log('App.js:46 data',data);
        
        this.setState({
          cryptos: data.cryptos,
          converted: data.converted,
          coinSymbols: data.coinSymbols
        }
      )
    }.bind(this))

    // axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + coinSymbolsDefault + '&tsyms=USD')
    //   .then(res => {
    //     var converted = {};
    //     const cryptos = res.data;

    //     for ( var key in cryptos ) {
    //       converted[key] = { 
    //         quantity:   1,
    //         ratio:      cryptos[key].USD,
    //         dollars:    cryptos[key].USD
    //       }
    //     }

    //     this.setState({
    //       cryptos: cryptos,
    //       converted: converted,
    //       coinSymbols: coinSymbolsDefault
    //     });

    //   });

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
      var numericDollar = 0; 
      numericDollar = parseFloat(e.target.value.replace("$","").replace(/,/g,"")).toFixed(10);

      converted[key] = {
          quantity:   (1/this.state.converted[key].ratio) * numericDollar,
          ratio:      this.state.converted[key].ratio,
          dollars:    e.target.value
      };

      this.setState({
        converted,
      });

      return;

    }

    return false;

  };


  handleChange(tags,changed) {

    this.setState({tags});
    console.log('App.js:114 tags',tags);
    console.log('App.js:114 changed',changed);

    helpers.getCryptoPrices(tags)
      .then((data) => {
        console.log('App.js:133 data',data);
        return data;

      })
      .then((data) => {
        
        this.setState({
          cryptos: data.cryptos,
          converted: data.converted,
          coinSymbols: data.coinSymbols
        });

      });

  }


  render() {

    window.state = this.state; // for console debugging only
    window.props = this.props;

    function autocompleteRenderInput ({addTag, ...props}) {

      const handleOnChange = (e, {newValue, method}) => {
        if (method === 'enter') {
          e.preventDefault()
        } else {
          props.onChange(e)
        }
      }

      const inputValue = (props.value && props.value.trim().toLowerCase()) || ''
      const inputLength = inputValue.length

      // let suggestions = states().filter((state) => {
      //   return state.name.toLowerCase().slice(0, inputLength) === inputValue
      // });

      // return (
      //   <Autosuggest
      //     ref={props.ref}
      //     suggestions={suggestions}
      //     shouldRenderSuggestions={(value) => value && value.trim().length > 0}
      //     getSuggestionValue={(suggestion) => suggestion.name}
      //     renderSuggestion={(suggestion) => <span>{suggestion.name}</span>}
      //     inputProps={{...props, onChange: handleOnChange}}
      //     onSuggestionSelected={(e, {suggestion}) => {
      //       addTag(suggestion.name)
      //     }}
      //     onSuggestionsClearRequested={() => {}}
      //     onSuggestionsFetchRequested={() => {}}
      //   />
      // )

      let suggestions = Object.keys(coinListMini).reduce(function(newObj,key) {

        if ( inputLength > 1 && coinListMini[key].Symbol.toString().toLowerCase().slice(0,inputLength) === inputValue ) {

          newObj.push({
            "Id" : coinListMini[key].Id,
            "Name" : coinListMini[key].Name,
            "Symbol" : coinListMini[key].Symbol,
            "CoinName" : coinListMini[key].CoinName,
            "FullName" : coinListMini[key].FullName
          });

        }

        return newObj;

      }, []);

      return (
        <Autosuggest
          ref={props.ref}
          suggestions={suggestions}
          shouldRenderSuggestions={(value) => value && value.trim().length > 1}
          getSuggestionValue={(suggestion) => suggestion.Symbol}
          renderSuggestion={(suggestion) => <span>{suggestion.FullName}</span>}
          inputProps={{...props, onChange: handleOnChange}}
          onSuggestionSelected={(e, {suggestion}) => {
            addTag(suggestion.Symbol)
          }}
          onSuggestionsClearRequested={() => {}}
          onSuggestionsFetchRequested={() => {}}
        />
      )
    }

    return (

      <div className="App">
        <TagsInput renderInput={autocompleteRenderInput} value={this.state.tags} onChange={this.handleChange.bind(this)} />

        {Object.keys(this.state.cryptos).map((key) => (
          <div id="crypto-container">
            <span className="currency">
              <input type="text" 
                defaultValue={1} 
                decimalscale="true"
                decimalprecision={10}
                min=".0000000001"
                value={this.state.converted[key].quantity} 
                onChange={this.changeCrypto.bind(this,key)}/> {key}
            </span>
            <span className="base currency">
              <NumberFormat 
                value={this.state.converted[key].dollars} 
                decimalscale="true"
                decimalprecision={3} 
                min=".0000000001"
                thousandSeparator={true} 
                prefix={'$'}
                onChange={this.changeDollar.bind(this,key)} /> USD
            </span>
            <div className="conversion-rate">1 {key} equals&nbsp;
              <NumberFormat
                value={this.state.cryptos[key].USD} 
                displayType="text"
                thousandSeparator={true} 
                prefix={'$'}
                /> USD
            </div>
          </div>
        ))}
      </div>
    )
  };
}

export default App;
