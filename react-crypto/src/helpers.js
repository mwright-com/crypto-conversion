import axios from 'axios';

var helpers = {
	getCryptoPrices: function(coinSymbols){

		const pricemulti = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + coinSymbols + '&tsyms=USD';
		const pricemultifull = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + coinSymbols + '&tsyms=USD'

	    return axios.get(pricemultifull)
	      	.then(res => {
	        	var converted 		= {};
	        	var cryptos 		= res.data.RAW;
	        	var totalDollars 	= 0;

		        for ( var key in cryptos ) {
					converted[key] = { 
						quantity:   1,
						ratio:      	cryptos[key].USD.PRICE,
						dollars:    	cryptos[key].USD.PRICE,
						changePercent: 	cryptos[key].USD.CHANGEPCT24HOUR
					}
					totalDollars = totalDollars*1 + cryptos[key].USD.PRICE*1
		        }
		        console.log('helpers.js:18 coinSymbols',coinSymbols);
		        console.log('helpers.js:18 res',res);



		        return {
					cryptos: cryptos,
					converted: converted,
					coinSymbols: coinSymbols,
					totalDollars: totalDollars
		        }
	        });
    }
}

module.exports = helpers;

// https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XLM&tsyms=USD