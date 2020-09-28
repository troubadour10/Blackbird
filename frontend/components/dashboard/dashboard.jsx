import React from 'react';
import DashboardChart from './dashboard_chart';
import BuyingPowerForm from './buying_power_form';

export default class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      totalValue: 0,
      dayPriceChange: 0,
      dayPercentChange: 0,
      data: null,
      buyingPowerFormActive: false
    };

    this.fetchRealtimeQuotes = this.fetchRealtimeQuotes.bind(this);
    this.calculateTotalValue = this.calculateTotalValue.bind(this);
    this.formatIntraData = this.formatIntraData.bind(this);
    this.handleRangeClick = this.handleRangeClick.bind(this);
    this.formatHistData = this.formatHistData.bind(this);
    this.buyingPowerFormClick = this.buyingPowerFormClick.bind(this);
  }

  componentDidMount() {
    // this.props.startLoading();
    // debugger
    this.props.fetchUser(this.props.match.params.userId)
      .then(() => this.fetchRealtimeQuotes()
        .then(() => this.formatIntraData())
        .then(() => this.calculateTotalValue())
      );
  }
  
  handleRangeClick(range, e) {
    e.preventDefault();
    const symbols = this.createSymbolStr();
    this.props.requestHistoricalPrices(symbols, range)
      .then(() => this.formatHistData());
  }

  buyingPowerFormClick() {
    this.setState({ buyingPowerFormActive: !this.state.buyingPowerFormActive});
  }

  createSymbolStr() {
    const { shares, watchlists } = this.props;
    // debugger
    const symbolArr = [];
    shares.forEach(share => {
      symbolArr.push(share.companyId);
    });
    watchlists.forEach(watchlist => {
      watchlist.companyIds.forEach(symbol => {
        symbolArr.push(symbol);
      });
    });
    const uniqueSymbols = [...new Set(symbolArr)];
    return uniqueSymbols.join(',');
  }

  fetchRealtimeQuotes() {
    const { requestQuotes } = this.props;
    const symbols = this.createSymbolStr();
    return requestQuotes(symbols);
  }

  isShareOwned(quote) {
    return Boolean(this.props.user.shares[quote.symbol]);
  }

  calculateTotalValue() {
    const { quotes, user } = this.props;
    let sum = user.availableFunds;
    let changePrice = 0;
    let changePercent = 0;
    quotes.forEach(quote => {
      if (this.isShareOwned(quote)) {
        const num_owned = user.shares[quote.symbol].numSharesOwned;
        sum += (quote.iexRealtimePrice * num_owned); // delayedPrice or iexRealtimePrice?
        changePrice += (quote.change * num_owned);
        changePercent += (quote.changePercent * num_owned);
      }
    });
    this.setState({ 
      totalValue: sum.toFixed(2),
      dayPriceChange: changePrice.toFixed(2),
      dayPercentChange: changePercent.toFixed(2)
    });
  }

  formatIntraData() {
    const { quotes, user } = this.props;
    const dataObj = {};
    quotes.forEach(quote => {
      if (this.isShareOwned(quote)) {
        let i = 0;
        const num_owned = user.shares[quote.symbol].numSharesOwned;
        let nullPrice;
        quote.intradayPrices.forEach(price => {
          if (i % 5 === 0) {
            i++;
            if (price.average === null) {
              price.average = nullPrice;
            }
            nullPrice = price.average;   
            let sum = 0;
            sum += (price.average * num_owned);
            if (dataObj[price.label]) {
              dataObj[price.label]['price'] += sum;
            } else {
              dataObj[price.label] = {
                'date/time': price.label,
                'price': sum
              };
            }
          } else {
            i++;
            null;
          }
        });
      }
    });
    // debugger
    this.setState({ data: Object.values(dataObj) });
  }

  formatHistData() {
    const { quotes, user } = this.props;
    const dataObj = {};
    quotes.forEach(quote => {
      if (this.isShareOwned(quote)) {
        const num_owned = user.shares[quote.symbol].numSharesOwned;
        let timeStr;
        quote.chart.forEach(price => {
          // debugger
          if (price.average) {
            timeStr = price.date + ', ' + price.label;
          } else {
            timeStr = price.date;
          }
          let sum = 0;
          sum += (price.high * num_owned);
          if (dataObj[timeStr]) {
            dataObj[timeStr]['price'] += sum;
          } else {
            dataObj[timeStr] = {
              'date/time': timeStr,
              'price': sum
            };
          }
        });

      }
    });
    this.setState({ data: Object.values(dataObj)});
    // debugger
  }






  render() {
    const { user, quotes, shares, updateUser } = this.props;
    return (
      <div className='dashboard-left'>
        {/* <button onClick={this.fetchBatchIntradayPrices}>intraday prices</button> */}
        <div className='dashboard-content'>

       
        <div className='dashboard-main'>
          <div className='total-account-value'>
            <h1>${this.state.totalValue}</h1>
            {this.state.dayPriceChange >= 0 ? (
              <p>+${this.state.dayPriceChange}</p>
            ) : (
              <p>-${this.state.dayPriceChange}</p>
            )}
            {this.state.dayPercentChange >= 0 ? (
              <p>(+{this.state.dayPercentChange}%)</p>
            ) : (
              <p>(-{this.state.dayPercentChange}%)</p>
            )}
          </div>
          <div className='dashboard-graph'>
            <DashboardChart 
              // quotes={quotes} 
              // user={user} 
              // shares={shares} 
              data={this.state.data}
              dayChange={this.state.dayPriceChange}
            />
          </div>
          <div className='range-btns'>
              <button className='range-btn' onClick={this.formatIntraData}>1D</button>
              <button className='range-btn' onClick={e => this.handleRangeClick('5dm', e)}>1W</button>
              <button className='range-btn' onClick={e => this.handleRangeClick('1mm', e)}>1M</button>
              <button className='range-btn' onClick={e => this.handleRangeClick('3m', e)}>3M</button>
              <button className='range-btn' onClick={e => this.handleRangeClick('1y', e)}>1Y</button>
          </div>
          <div className='buying-power-dd'>
            {this.state.buyingPowerFormActive ? (
              <div>
                <button onClick={this.buyingPowerFormClick} className='buying-power-btn active'>
                  <p>Buying Power</p>
                </button>
                  <BuyingPowerForm user={user} updateUser={updateUser}/>
              </div>
            ) : (
              <button onClick={this.buyingPowerFormClick} className='buying-power-btn'>
                <p>Buying Power</p>
                <p>${user.availableFunds.toFixed(2)}</p>
              </button>
            )}
          </div>
        </div>
        <br/>
        {/* <div className='dashboard-sidebar-component'>
          <DashboardSidebar />
        </div> */}

        </div>
      </div>
    );
  }
}