import axios from 'axios';

var helpers = {
	getCryptoPrices: function(coinSymbols){

		const pricemulti = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + coinSymbols + '&tsyms=USD';
		const pricemultifull = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + coinSymbols + '&tsyms=USD'

	    return axios.get(pricemulti)
	      	.then(res => {
	        	var converted = {};
	        	var cryptos = res.data;
	        	// var cryptosFull = res.data.RAW;

		        for ( var key in cryptos ) {
					converted[key] = { 
						quantity:   1,
						ratio:      cryptos[key].USD,
						dollars:    cryptos[key].USD
					}
		        }
		        console.log('helpers.js:18 coinSymbols',coinSymbols);
		        console.log('helpers.js:18 res',res);

		        return {
					cryptos: cryptos,
					converted: converted,
					coinSymbols: coinSymbols
		        }
	        });
    }
}

module.exports = helpers;

// https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XLM&tsyms=USD