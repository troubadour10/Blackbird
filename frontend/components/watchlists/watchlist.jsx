import React from 'react';
import WatchlistItem from './watchlist_item';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

export default class Watchlist extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      companyName: false,
      symbol: false,
      latestPrice: false,
      changePercent: false,
      marketCap: false,
      desc: false,
      nameFormActive: false,
      name: ''
    };
    this.handleHeaderClick = this.handleHeaderClick.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.quotesToState = this.quotesToState.bind(this);
  }

  componentDidMount() {
    const { fetchWatchlist, requestQuotes, receiveColor } = this.props;
    receiveColor('limegreen');
    fetchWatchlist(this.props.match.params.watchlistId)
      .then(res => requestQuotes(res.watchlist.companyIds.toString())
      .then(() => this.quotesToState()));
  }

  quotesToState() {
    const { watchlist, quotes } = this.props;
    this.setState({ quotes, name: watchlist.name });
  }

  handleHeaderClick(val) {
    let { desc } = this.state;
    return e => {
      if (!this.state[val]) {
        desc = false;
      }
      if (desc) {
        this.state.quotes.sort(this.sortList(val, 'desc'));
      } else {
        this.state.quotes.sort(this.sortList(val));
      }
      this.setState({ 
        companyName: false,
        symbol: false,
        latestPrice: false,
        changePercent: false,
        marketCap: false,
        desc: !desc
      });
      this.setState({ [val]: true });
    };
  }

  sortList(key, order = 'asc') {
    return (a, b) => {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }
      const aVal = a[key];
      const bVal = b[key];
      let comp = 0;
      if (aVal > bVal) {
        comp = 1;
      } else if (aVal < bVal) {
        comp = -1;
      }
      return order === 'asc' ? comp : (comp * -1);
    };
  }

  handleNameClick() {
    this.setState({ nameFormActive: true });
  }

  handleNameChange(e) {
    this.setState({ name: e.currentTarget.value });
  }

  handleBlur(e) {
    this.setState({ nameFormActive: false });
    this.handleSubmit(e);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { watchlist, updateWatchlistName } = this.props;
    watchlist.name = e.currentTarget.value;
    updateWatchlistName(watchlist);
  }


  render() {
    const { watchlist, removeCompanyFromWatchlist } = this.props;
    const { 
      quotes, companyName, symbol, latestPrice, changePercent, marketCap, desc,
      nameFormActive, name
    } = this.state;
    if (!quotes || !watchlist) return null;
    const length = watchlist.companyIds.length;
    const active = 'limegreen-h limegreen-bb3';
    const inActive = 'limegreen-h';
    const downArrow = <FontAwesomeIcon icon={faAngleDown} />;
    const upArrow = <FontAwesomeIcon icon={faAngleUp} />;
    return (
      <div className='watchlist-left'>
        <div className='watchlist-content'>
          <div className='watchlist-main'>
            {nameFormActive ? (
              <form className='watchlist-name-form' onSubmit={this.handleSubmit}>
                <input 
                  type="text"
                  className='watchlist-name-input'
                  value={name} 
                  placeholder='Edit List Name'
                  onChange={this.handleNameChange}
                  onBlur={this.handleBlur}
                  autoFocus
                />
              </form>
            ) : (
              <button className='watchlist-name' onClick={this.handleNameClick}>
                <h1>{watchlist.name}</h1>
              </button>
            )}
            <span className='watchlist-length'>{`${length} items`}</span>
            <ul className='watchlist-index'>
              <li className='watchlist-index-header'>
                <button className={`${companyName ? active : inActive} header-name`} onClick={this.handleHeaderClick('companyName')}>
                  Name
                  {companyName && !desc ? <span className='name-arrow'>{downArrow}</span> : null}
                  {companyName && desc ? <span className='name-arrow'>{upArrow}</span> : null}
                </button>
                <button className={`${symbol ? active : inActive} header-symbol`} onClick={this.handleHeaderClick('symbol')}>
                  Symbol
                  {symbol && !desc ? <span className='symbol-arrow'>{downArrow}</span> : null}
                  {symbol && desc ? <span className='symbol-arrow'>{upArrow}</span> : null}
                </button>
                <button className={`${latestPrice ? active : inActive} header-price`} onClick={this.handleHeaderClick('latestPrice')}>
                  Price
                  {latestPrice && !desc ? <span className='price-arrow'>{downArrow}</span> : null}
                  {latestPrice && desc ? <span className='price-arrow'>{upArrow}</span> : null}
                </button>
                <button className={`${changePercent ? active : inActive} header-today`} onClick={this.handleHeaderClick('changePercent')}>
                  Today
                  {changePercent && !desc ? <span className='today-arrow'>{downArrow}</span> : null}
                  {changePercent && desc ? <span className='today-arrow'>{upArrow}</span> : null}
                </button>
                <button className={`${marketCap ? active : inActive} header-mktcap`} onClick={this.handleHeaderClick('marketCap')}>
                  Market Cap
                  {marketCap && !desc ? <span className='mktcap-arrow'>{downArrow}</span> : null}
                  {marketCap && desc ? <span className='mktcap-arrow'>{upArrow}</span> : null}
                </button>
              </li>
              {quotes.map(quote => {
                if (watchlist.companyIds.includes(quote.symbol)) {
                  return (
                    <WatchlistItem 
                      key={quote.symbol}
                      watchlist={watchlist}
                      quote={quote} 
                      removeCompanyFromWatchlist={removeCompanyFromWatchlist}
                    />
                  );
                }
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}