import React from 'react';

export default class Dashboard extends React.Component {
  render() {
    return (
      <div>
        Dashboard Placeholder
        <br/>
        <button onClick={this.props.logout}>CLICK TO LOGOUT</button>
      </div>
    );
  }
}