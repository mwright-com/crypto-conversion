const Countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Anguilla"
]; 

function states () {
  return [
    {abbr: 'AL', name: 'Alabama'},
    {abbr: 'AK', name: 'Alaska'},
    {abbr: 'AZ', name: 'Arizona'},
    {abbr: 'AR', name: 'Arkansas'},
    {abbr: 'CA', name: 'California'},
    {abbr: 'CO', name: 'Colorado'},
    {abbr: 'CT', name: 'Connecticut'}
  ]
}


import React, { Component } from 'react';
import './App.css';
import './react-tagsinput.css';
import axios from 'axios';
import TagsInput from 'react-tagsinput';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';

var NumberFormat = require('react-number-format');

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cryptos: [],
      tags: Countries,
      suggestions: Countries
    }

    console.log('App.js:31 props',props);
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

      let suggestions = states().filter((state) => {
        return state.name.toLowerCase().slice(0, inputLength) === inputValue
      })

      return (
        <Autosuggest
          ref={props.ref}
          suggestions={suggestions}
          shouldRenderSuggestions={(value) => value && value.trim().length > 0}
          getSuggestionValue={(suggestion) => suggestion.name}
          renderSuggestion={(suggestion) => <span>{suggestion.name}</span>}
          inputProps={{...props, onChange: handleOnChange}}
          onSuggestionSelected={(e, {suggestion}) => {
            addTag(suggestion.name)
          }}
          onSuggestionsClearRequested={() => {}}
          onSuggestionsFetchRequested={() => {}}
        />
      )
    }

    return (

      <div className="App">
        <TagsInput renderInput={autocompleteRenderInput} value={this.state.tags} onChange={this.handleChange.bind(this)} />

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
