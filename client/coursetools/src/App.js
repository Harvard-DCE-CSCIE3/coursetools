// Table.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.js';
import Main from './Main.js';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

//import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import "react-datepicker/dist/react-datepicker.css";



class App extends Component {

  render() {
    return (

      <div>
        <Main />
      </div>
    );
  }
}

  export default App;
