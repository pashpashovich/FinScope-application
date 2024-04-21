import React from 'react';

class ConnectionExample extends React.Component {
  componentDidMount() {
    const apiUrl = "http://localhost:8000/accounts/2/";
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => console.log(data));
  }

  render() {
    return <div>Example connection</div>;
  }
}

export default ConnectionExample;