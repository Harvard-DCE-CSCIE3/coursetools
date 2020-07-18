// Table.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { AgGridReact } from 'ag-grid-react';
import Cog from 'dce-reactkit/lib/glyph/Cog';
import { Link } from 'react-router-dom'

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

//import Checkbox from 'dce-reactkit/glyph/Checkbox';

class Table extends Component {
  constructor(props) {
    super(props);
    console.log("Table props");
    console.log(props)
    this.state = {
      columnDefs: [
        { headerName: "ID",
          field: "id",
          resizable: true,
          maxWidth: 120,
          sortable:true,
          filter:true ,
          checkboxSelection: true,
          cellRenderer: 'courseLinkRenderer',
          cellRendererParams: {canvasHost: props.canvasHost},
        },

        { headerName: "Name", field: "name", resizable: true, sortable:true, filter:true, floatingFilter: true,
          filterParams: {
            filterOptions: ['contains', 'notContains'],
            debounceMs: 0,
            suppressAndOrCondition: true,
          },
        },
        { headerName: "Term", field: "term", maxWidth: 100, resizable: true, sortable:true , filter:true, floatingFilter: true,
          filterParams: {
            filterOptions: ['contains', 'notContains'],
            debounceMs: 0,
            suppressAndOrCondition: true,
          },},
          { headerName: "Account", field: "account_name", maxWidth: 200, resizable: true, sortable:true , filter:true, floatingFilter: true,
            filterParams: {
              filterOptions: ['contains', 'notContains'],
              debounceMs: 0,
              suppressAndOrCondition: true,
            },},
        { headerName: "State", field: "workflow_state", maxWidth: 100, resizable: true, sortable:true, filter:true, floatingFilter: true,
          filterParams: {
            filterOptions: ['contains', 'notContains'],
            debounceMs: 0,
            suppressAndOrCondition: true,
          },
        },
        { headerName: "Students", field: "total_students", resizable: true, sortable:true, filter:true, maxWidth: 100,},
        { headerName: "Start At", field: "start_at", resizable: true, sortable:true, filter: 'agDateColumnFilter' },
      ],
      rowData: props.modules,
      gridOptions: {
        defaultColDef:{ resizable: true },
        rowSelection: 'multiple',
        frameworkComponents:{
          courseLinkRenderer: CourseLinkRenderer,
        },
      },
      passSelectionToParent : props.onSelectionChanged,
    }
  }

  onGridReady = params => {
    console.log("on grid ready");
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
    const updateData = data => {
      this.setState({ rowData: data });

    };
  }

  onSelectionChanged(){
    var selectedRows = this.gridApi.getSelectedRows();
    //alert(selectedRows.length);
    this.state.passSelectionToParent(selectedRows)
  }


  componentDidMount() {
    console.log("table did mount");
    console.log(this.props.courses);
    this.setState({rowData: this.props.courses});
   }

   componentDidUpdate(prevProps) {
      if (this.props.loading == true) {
        this.gridApi && this.gridApi.showLoadingOverlay();
      }else{
        this.gridApi && this.gridApi.hideOverlay();
      }
      let defs = this.state.columnDefs;
      defs[0].cellRendererParams.canvasHost = prevProps.canvasHost;
    }

  render() {
    return (
      <div className="ag-theme-balham" style={ {height: '700px', width: '100%'} }>
        <AgGridReact
            columnDefs={this.state.columnDefs}
            rowData={this.props.courses}
            gridOptions={this.state.gridOptions}
            onGridReady={ params => {this.gridApi = params.api;    this.gridApi.sizeColumnsToFit();} }
            onSelectionChanged={this.onSelectionChanged.bind(this)}
            >
        </AgGridReact>
      </div>
    );
  }
}

function CourseLinkRenderer(props){
  return (
    <div className={'grid_actions'}>
      <a href={"https://"+props.canvasHost+"/courses/"+props.value} target="_blank">{props.value}</a>
      <div className="courselink-cog"><Link to={'/course/'+props.value} target="_blank"><Cog /></Link></div>
    </div>
  );
}

export default Table;
