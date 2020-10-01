import React from 'react';

export default class InvestInSharesForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.user.id,
      companyId: this.props.company.symbol,
      numSharesOwned: '',
      totalCost: null,
      error: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const { company } = this.props;
    const inputVal = e.currentTarget.value;
    if (inputVal === '') {
      this.setState({ numSharesOwned: '', error: null });
    } else {
      this.setState({ 
        numSharesOwned: parseFloat(inputVal),
        totalCost: parseFloat((inputVal * company.iexRealtimePrice).toFixed(2))
      });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const { user } = this.props;
    const { totalCost } = this.state;
    if (user.availableFunds < this.state.totalCost) {
      this.setState({ error: 'Insufficient Funds'});
    } else {
      user.availableFunds -= totalCost;
      this.props.createShare(this.state)
        .then(() => this.props.updateUser(user));
    }
  }

  render() {
    const { user, company, color, handleChange } = this.props;
    const { numSharesOwned, error } = this.state;
    if (!company) return null;
    // debugger
    return (
      <form onSubmit={this.handleSubmit} className='invest-in-shares-form'>
        <div className='shares-input-div'>
          <label>Shares</label>
          <input
            className={`shares-input ${color}-bfocus`}
            type="number"
            value={numSharesOwned}
            onChange={this.handleChange}
            placeholder='0'
          />
        </div>
        <div className='market-price-div'>
          <span className={`market-price ${color}`}>Market Price</span>
          <span>${company.iexRealtimePrice.toFixed(2)}</span>
        </div>
        <div className='estimated-cost'>
          <span>Estimated Cost</span>
          <span>${(numSharesOwned * company.iexRealtimePrice).toFixed(2)}</span>
        </div>
        <button className={`${color}-bg ${color}-hlite`}>Purchase Shares</button>
        {error ? <div className='share-error red'>{error}</div> : null}
      </form>
    );
  }


}