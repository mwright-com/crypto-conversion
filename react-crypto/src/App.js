
const arrCoinSymbols = [
  "BTC",
  "ETH",
  "XRP",
  "XLM"
];


import React, { Component } from 'react';
import './App.css';
import './react-tagsinput.css';
import axios from 'axios';
import TagsInput from 'react-tagsinput';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import coinListSmall from './coinlist';


var NumberFormat = require('react-number-format');
const coinListMini = coinListSmall;
console.log('App.js:32 coinListMini',coinListMini);

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cryptos: [],
      tags: arrCoinSymbols,
      suggestions: arrCoinSymbols.join(),
      coinListSmall: coinListMini
    }

    console.log('App.js:31 props',props);
  };

  componentDidMount() {
    //var coinSymbolsDefault = "BTC,ETH,XLM";
    var coinSymbolsDefault = arrCoinSymbols.join();

    axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + coinSymbolsDefault + '&tsyms=USD')
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
          coinSymbols: coinSymbolsDefault
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

  handleChange(tags) {
    this.setState({tags})
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

      // console.log('App.js:148 suggestions',suggestions);

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

      //let suggestions = Object.keys(coinListSmall).map(function(key) { return coinListSmall[key]; });

      // let suggestions = coinListSmall.keys(myObject).map(function(key,index){
      //   myObject[key] = key;
      // });

      // let suggestions = Object.keys(coinListSmall).reduce(key => {
      //     return coinListSmall[key] ? coinListSmall[key].Symbol.toString().toLowerCase().slice(0,inputLength) === inputValue : false;
      // });

console.log('App.js:166 Object.keys(coinListMini)',Object.keys(coinListMini));
console.log('App.js:166 coinListMini',Object.keys(coinListMini));
      let suggestions = Object.keys(coinListMini).reduce(function(newObj,key) {
        //console.log('coinListMini[key].Symbol.toString().toLowerCase().slice(0,inputLength)=',coinListMini[key].Symbol.toString().toLowerCase().slice(0,inputLength));
         
        console.log('App.js:171 key',key + ' : ' + inputValue);
        console.log('App.js:171 newObj',newObj);
        console.log('App.js:171 coinListMini[key].Symbol.toString().toLowerCase().slice(0,inputLength)',coinListMini[key].Symbol.toString().toLowerCase().slice(0,inputLength) + ' : ' + inputValue);
        if ( inputLength > 1 && coinListMini[key].Symbol.toString().toLowerCase().slice(0,inputLength) === inputValue ) {

          console.log('coinListMini[key].Symbol',coinListMini[key].Symbol);
          console.log('coinListMini[key]',coinListMini[key]);
          console.log('key',key);
          console.log('inputValue',inputValue);   

          newObj.push({
            "Id" : coinListMini[key].Id,
            "Name" : coinListMini[key].Name,
            "Symbol" : coinListMini[key].Symbol,
            "CoinName" : coinListMini[key].CoinName,
            "FullName" : coinListMini[key].FullName
          });
          console.log('App.js:187 newObj',newObj); 

        }
        //return newObj ? inputLength > 1 && coinListMini[key].Symbol.toString().toLowerCase().slice(0,inputLength) === inputValue : false;
        return newObj;
      }, []);

      console.log('App.js:177 suggestions',suggestions);

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
