
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

function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }

  return true;
};

function isArrAlphaNumeric(arr) {
  return arr.reduce(function(bool,index){
    if (!bool) return false;
    if (!isAlphaNumeric(index)) return false;
    return true;

  },true);
}

function arrOnlycoins(arr) {
  arr = arr.reduce(function(newArr,tag){ 
    newArr.push(tag)
    if ( this.state.coinListSmall.indexOf(tag) != -1 ) newArr.push(tag);
    return newArr;
  },[]);
  return arr;
}

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
        
        this.setState({
          cryptos:        data.cryptos,
          converted:      data.converted,
          coinSymbols:    data.coinSymbols,
          totalDollars:   data.totalDollars
        }
      )
    }.bind(this))

  };

  changeCrypto(key, e){      

    if ( e !== undefined ) {
      const converted = this.state.converted;
      converted[key] = {
          quantity:       e.target.value,
          ratio:          this.state.converted[key].ratio,
          dollars:        this.state.converted[key].ratio * e.target.value, 
          changePercent:  this.state.converted[key].changePercent,
      };

      var totalDollars = Object.keys(converted).reduce(function(total, key) {
          var convertedDollars = isNaN(converted[key].dollars*1) ? 0 : converted[key].dollars*1;
          converted[key].dollars = isNaN(converted[key].dollars*1) ? 0 : converted[key].dollars*1;
          total = total*1 + convertedDollars;
          return total;
      },0);

      this.setState({
        converted: converted,
        totalDollars: totalDollars
      });

      return;
    }
    return false;
  };

  changeDollar(key, e){      

    if ( e !== undefined ) {
      const converted = this.state.converted;

      // Remove dollar formatting
      var that = this;
      var numericDollar = parseFloat(e.target.value.replace("$","").replace(/,/g,"")).toFixed(10);
      var quantity = (1/this.state.converted[key].ratio) * numericDollar;

      converted[key] = {
          quantity:   isNaN(quantity) ? 0 : quantity,
          ratio:      this.state.converted[key].ratio,
          dollars:    e.target.value, 
          changePercent:  this.state.converted[key].changePercent
      };

      var totalDollars = Object.keys(converted).reduce(function(total, key) {
          var convertedDollars = isNaN(that.stripDollarFormatting(converted[key].dollars)*1) ? 0 : that.stripDollarFormatting(converted[key].dollars)*1;
          total = total*1 + convertedDollars;
          return total;
      },0);

      this.setState({
        converted: converted,
        totalDollars: totalDollars
      });

      return;
    }
    return false;
  };

  stripDollarFormatting(dollarAmount) {
    return parseFloat(dollarAmount.toString().replace("$","").replace(/,/g,"")).toFixed(10);
  }

  handleTagChange(tag) {
    this.setState({tag})
  };

  handleTagsChange(tags,changed) { // 'tags' and 'changed' are returned back from the TagsInput component

    var that = this;

    // Get the newly added tags
    var arrAddedTags = changed.reduce(function(newArr,tag){ 
      if ( tags.indexOf(tag.toUpperCase()) != -1 ) newArr.push(tag);
      return newArr;
    },[]);

    // Remove newly added tags that are not coins in the this.state.coinListSmall array
    // and remove anything that is not alphanumeric
    var arrAddedCoins = arrAddedTags.reduce(function(newArr,tag){ 
      if ( Object.keys(that.state.coinListSmall).indexOf(tag) != -1 || isAlphaNumeric(tag) ) newArr.push(tag);
      return newArr;
    },[]);

    // Get newly added tags that are not in the coin list, nor are alphanumeric    
    var arrBrokenTags = arrAddedTags.reduce(function(newArr,tag){
      if ( Object.keys(that.state.coinListSmall).indexOf(tag) == -1 || !isAlphaNumeric(tag) ) newArr.push(tag);
      return newArr;
    },[]);

    // Remove broken tags from the tag list
    tags = tags.reduce(function(newArr,tag){

      if ( arrBrokenTags.indexOf(tag) == -1 ) newArr.push(tag);

      return newArr;
    },[]);

    // Change all tags to uppercase
    tags = tags.map(function(tag){ return tag.toUpperCase() });

    // Now we can change the state
    this.setState({tags});

    helpers.getCryptoPrices(tags)
      .then((data) => {
        return data;
      })
      .then((data) => {
        
        this.setState({
          cryptos:        data.cryptos,
          converted:      data.converted,
          coinSymbols:    data.coinSymbols,
          totalDollars:   data.totalDollars
        });

      });

  };

  render() {

    window.state = this.state; // for console debugging only
    window.props = this.props;

    function upOrDown(val){
      if ( val >= 0 ) return ' up ';
      if ( val < 0 ) return ' down ';
      if ( val == 0 ) return;
    };

    function autocompleteRenderInput ({addTag, ...props}) {

      const handleCharChange = (e, {newValue, method}) => {
        if (method === 'enter') {
          e.preventDefault();
        } else {
          props.onChange(e)
        }
      }

      props.placeholder = '+ Add a coin or token';
      // props.addKeys = [9, 13, 32, 44];

      const inputValue = (props.value && props.value.trim().toUpperCase()) || ''
      const inputLength = inputValue.length

      let suggestions = Object.keys(coinListMini).reduce(function(newObj,key) {

        if ( inputLength > 1 && coinListMini[key].Symbol.toString().toUpperCase().slice(0,inputLength) === inputValue ) {

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
          inputProps={{...props, onChange: handleCharChange}}
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
        <TagsInput renderInput={autocompleteRenderInput} 
        value={this.state.tags} 
        onChange={this.handleTagsChange.bind(this)}
        onChangeInput={this.handleTagChange.bind(this)}
        className = 'react-tagsinput container' />

        <div className="total-dollars container">Total Value: <span class="black"><NumberFormat
          value={this.state.totalDollars}
          displayType={'text'}
          className="total-dollars-amount"
          defaultValue={0}
          prefix={'$'}
          decimalScale={2}
          fixedDecimalScale={true}
          thousandSeparator={true} 
        /></span></div>

        {Object.keys(this.state.cryptos).map((key) => (
          <div class="crypto-container container">
            <span className="currency">
              <input type="text" 
                value={this.state.converted[key].quantity} 
                className = {'change right ' + upOrDown(this.state.cryptos[key].USD.CHANGEPCT24HOUR)}
                defaultValue={1} 
                decimalScale={this.state.converted[key].quantity > 1 ? 2 : false}
                fixedDecimalScale={this.state.converted[key].quantity > 1 ? true : false}
                onChange={this.changeCrypto.bind(this,key)}/> 
                <span className="currency-name">{key}</span>
                <span className="currency-name-small">{this.state.coinListSmall[key].FullName}</span>
            </span>
            <div class="base-currency-container">
              <span className="base currency">
                <NumberFormat 
                  value={this.state.converted[key].dollars} 
                  className = {'change right ' + upOrDown(this.state.cryptos[key].USD.CHANGEPCT24HOUR)}
                  thousandSeparator={true} 
                  prefix={'$'}
                  decimalScale={this.state.converted[key].dollars*1 > 1 ? 2 : 10}
                  fixedDecimalScale={this.state.converted[key].dollars*1 > 1 ? true : false}
                  onChange={this.changeDollar.bind(this,key)} /><span class="base-currency-name">USD</span>
              </span>
              <span className={'change right ' + upOrDown(this.state.cryptos[key].USD.CHANGEPCT24HOUR)}>
                ({Math.round(this.state.cryptos[key].USD.CHANGEPCT24HOUR * 100) / 100}%)
              </span>
            </div>
            <span className="conversion-rate"><span class="black">1 {this.state.coinListSmall[key].FullName} equals</span><br />&nbsp;
              <NumberFormat
                value={this.state.cryptos[key].USD.PRICE} 
                displayType="text"
                thousandSeparator={true} 
                prefix={'$'}
                />
            </span>
            <span className="conversion-rate-small">1 {key} equals&nbsp;
              <NumberFormat
                value={this.state.cryptos[key].USD.PRICE} 
                displayType="text"
                thousandSeparator={true} 
                prefix={'$'}
                />
            </span>
          </div>
        ))}
      </div>
    )
  };
}

export default App;
