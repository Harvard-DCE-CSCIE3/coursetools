// Table.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [
        { headerName: "ID", field: "id", resizable: true, maxWidth: 100 },
        { headerName: "Name", field: "name", resizable: true, editable: true },
        { headerName: "Unlock At", field: "unlock_at_str", resizable: true },
        { headerName: "Due At", field: "due_at_str", resizable: true }
      ],
      rowData: props.modules,
      defaultColDef: { resizable: true },
    }
  }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
    const updateData = data => {
      this.setState({ rowData: data });

    };
  }

  componentDidMount() {
    console.log("table did mount");
    console.log(this.props.modules);
    this.setState({rowData: this.props.modules});
   }

  render() {
    return (
      <div className="ag-theme-balham" style={ {height: '500px', width: '100%'} }>
        <AgGridReact
            columnDefs={this.state.columnDefs}
            rowData={this.props.modules}
            onGridReady={ params => {this.gridApi = params.api;    this.gridApi.sizeColumnsToFit();} }>
        </AgGridReact>
      </div>
    );
  }
}

  export default Table;
