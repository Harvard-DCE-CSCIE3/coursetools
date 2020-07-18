// Header.js
import React, { Component } from 'react';
import DataGrid from 'react-data-grid';
import {Row as DataGridRow} from 'react-data-grid';
//import  RowWithCellKeys from './RowWithCellKeys';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faSync } from '@fortawesome/free-solid-svg-icons'
import { faEye } from '@fortawesome/free-solid-svg-icons'
//import 'react-data-grid/dist/react-data-grid.css';
import { Container, Col, Row, Button, Modal  } from 'react-bootstrap';
import Preview from './Preview';
import { DatePickerFormatterUnlock, DatePickerFormatterDue } from './DatePickerFormatter';
import APIService from './util/APIService';



const columns = [
  { key: "position", name: "Actions", width: 75, resizeable: false, formatter: ActionsFormatter },
  { key: "name", name: "Name (double-click to edit)", width: 400, resizeable: true, editable: true, formatter: EditableFormatter,},
  { key: "published", name: "Published", width: 100, formatter: PublishedFormatter, resizeable: true, },
  { key: "type", name: "Type", width: 110, resizeable: true,},
  { key: "unlock_at", name: "Unlock At", resizeable: true, formatter: DatePickerFormatterUnlock, },//editor: DatePickerEditor,
  { key: "due_at", name: "Due At", resizeable: true, formatter: DatePickerFormatterDue, },//editor: DatePickerEditor,
];

let data=[];

function PublishedFormatter( el ) {
  let row = el.row;
  if (row.modified && row.modified.includes('published')){
    // this is a modified cell: highlight it
    return <span className={'edited_cell'}>{el.value ? "Yes" : "No"}</span>
  }
  return <span>{el.value ? "Yes" : "No"} </span>;
}

function EditableFormatter( el ){
    // check each modified field for a match to this value

  let row = el.row;
  //if (row.id = 1947828) console.log(el);
  for (let i=0; row.modified && i<row.modified.length; i++){
    let key = row.modified[i];
    if (row[key] == el.value){
      // this is a modified cell: highlight it
      return <span className={'edited_cell indent-'+row.indent}>{el.value}</span>
    }
  }
  return <span className={'indent-'+row.indent}>{el.value}</span>;
}

function ActionsFormatter( el ){
    // check each modified field for a match to this value
  let row = el.row;
  //handle before url is populated
  let u = el.row.url || '';

  // Ignore ExternalTool type, regardless of its properties
  if (row.type=="ExternalTool"){
    return <span></span>;
  }
  // Handle ExternalUrl case with direct link only
  if (row.external_url){
    return <span><a href={row.external_url} target="_blank" title="Open in Canvas (opens in a new window)"><FontAwesomeIcon className="externalLinkIcon" icon={faExternalLinkAlt} /></a></span>;
  }
  // For all other tools (Canvas tools), get the direct URL
  // remove /api/v1 from the url
  let url = u.match(/([\s\S]*?)\/api\/v1([\s\S]*)/);
  if (url && url.length>0){
    return <span><a href={url[1]+url[2]} target="_blank" title="Open in Canvas (opens in a new window)"><FontAwesomeIcon className="externalLinkIcon" icon={faExternalLinkAlt} /></a><Preview item={row}/></span>;
  }
  return <span></span>;
}

function PreviewClick(e){
  console.log('preview clicked');
  return false;
}
function CustomRowRenderer(props) {
   // Here the height of the base row is overridden by a value of 100
   //console.log(props);
   if (props.row.type == "Module"){
     return <div className={'module_row'}><DataGridRow {...props} /></div> // datgridrow
     //return renderBaseRow({...canvasProps, extraClasses: 'module_row'});
   }else{
     return <DataGridRow {...props} />;  //DataGridRow
   }
}
/*function CustomRowRenderer(renderBaseRow, ...canvasProps) {
 // Here the height of the base row is overridden by a value of 100
 console.log("canvasProps");console.log(canvasProps);
 return renderBaseRow({...canvasProps, height: 100});
}*/

class CourseModules extends Component {

  constructor(props){
    super(props);
    this.state= {
      data: [],
      modified: false,
      refresh: false,
      showSaveResults: false,
      responses: [],
    }
    this.dateHandler = this.dateHandler.bind(this);
    this.saveToCanvas = this.saveToCanvas.bind(this);
    this.clearModifiedFlags = this.clearModifiedFlags.bind(this);
    this.getCellActions = this.getCellActions.bind(this);
    this.clearAllDates = this.clearAllDates.bind(this);
    this.bulkPublish = this.bulkPublish.bind(this);
  }

  componentDidMount() {
    console.log("table did mount");
    console.log(this.props.course);
    const mods = this.props.course.modules || [];
    this.setState({data: this.flattenModuleData(mods)});
   }

   //componentDidUpdate(prevProps) {
  componentWillReceiveProps(nextProps) {
     console.log("table getting props");
     //console.log(this.props.course);
     //const mods = this.props.course.modules || [];
     //console.log(nextProps.course);
     const mods = nextProps.course.modules || [];
     //if (prevProps.course.modules.length != this.props.course.modules.length) {
       //console.log('tableDidUpdate, saving state')
       this.setState({data: this.flattenModuleData(mods)});
     //}
    }

    onGridRowsUpdated = ({ fromRow, toRow, updated, cellKey, fromRowData }) => {
      this.setState({modified: true,})
      // see if this is changed
      this.setState(state => {
        const data = state.data.slice();
        for (let i = fromRow; i <= toRow; i++) {
          data[i] = { ...data[i], ...updated };  //this gets us a row
          for (let el in updated){  // get property names of updated
            if (updated[el] != fromRowData[el]){ // if the value has changed
              if (data[i].modified.indexOf(el) == -1 ){ // this ;looks for the key name in the modified list
                data[i].modified.push(el);
                console.log("pushing modified: "+ el + " to " + data[i].modified );
              }
            }
          }
        }
        return { data };
      });
  };

 /* Turn the modules/module_items nesting into a flat structure for
    rendering by the table
    */
  flattenModuleData(modules){
    console.log("flattening");//console.log(modules);
    let data = [];
    // for each module
    for(let i=0; modules && i<modules.length; i++){
      // insert modules[i] into the data array
      let m  = modules[i];
      m.type = 'Module';
      m.modified = [];
      data.push(m);
      // now push all the module_items onto the array, adding a name field to normalise title to name for items
      for (let k=0; m.items && k<m.items.length; k++){
        let o = m.items[k];
        o.name = o.title;
        o.modified = [];
        // and flatten content_details into the item data as well (unlock_at, due_at for assignments/discussions)
        for(let m in o.content_details){
          o[m] = o.content_details[m];
        }
        data.push(o);
      }
    }
    console.log("flattened");console.log(data);
    data = this.addDateHandlerToRow(data);
    return data;
  }

  dateHandler(date, col, row){
    console.log("cjhanging date");
    // find this row in the state data
    let d = this.state.data;
    for (let i=0;i<d.length;i++){
      if (d[i].id == row.id){
        d[i][col] = (date && date.toISOString()) || null;//d[i][col+'new']
        d[i].modified.push(col);
        console.log("changed " + col + " to "+ d[i][col] ); //save this so I can revert d[i][col+'new']
        this.setState({data: d, modified: true,});
        return;
      }
    }
  }
  clearModifiedFlags(data){
    return data.map(row=>{
      row.modified = [];
      return row;
    })
  }

  addDateHandlerToRow(data){
    return data.map(row => {
      row.handleDateChange = this.dateHandler;
      // failed - update cycle refreshes this
      //row.unlock_at_orig = row.unlock_at || '';
      return row;
    });
  }
// used to force the grid to refresh (reports a fake table length, then fixes it)
// came from github issue resolution in react-data-grid
  getRowCount() {
      let count = this.state.data.length;
      console.log("count is "+ count);

      if(this.state.refresh && count > 0) {
        count--; // hack for update data-grid
        this.setState({
          refresh: false
        });
      }
      return count;
    }
  // works with above to force a refesh of the table
  refresh() {
      this.setState({
        refresh: true
      });
    }

  async saveToCanvas(){
    console.log("sAVING")
    APIService.updateModules(this.props.course.id, this.state.data).then((res)=>{ //await
      console.log('clearing flags');
      this.setState({data: this.clearModifiedFlags(this.state.data)});
      console.log("saved response");
      console.log(APIService.responses);
      this.setState({ showSaveResults: true, responses: APIService.responses, modified: false,})
      this.refresh();
      console.log('refreshed');
    });
  }

 getCellActions(column, row) {
    const cellActions = {
      published: [
         {
           icon: <span><FontAwesomeIcon className="externalLinkIcon" icon={faSync} /></span>,
           callback: ()=>{
             //iterate over state rows, look for matching id row from the data, chage publish field
             let d = this.state.data;
             for (let i=0;i<d.length;i++){
               if (d[i].id == row.id){
                 console.log('found the row, was '+d[i].published);
                 d[i].published = (d[i].published == true ? false : true);//d[i][col+'new']
                 console.log('now is '+d[i].published);
                 d[i].modified.push('published');
                 this.setState({data: d, modified: true,});
                 this.refresh();
                 return;
               }
             }
           }
        }
      ],
    };
    return cellActions[column.key];
  }

  clearAllDates(){
    let data = this.state.data;
    console.log(data);
    let newdata = data.map((row)=>{
      if (row.unlock_at != ''){
        row.unlock_at = '';
        row.modified.push('unlock_at')
      }
      if (row.due_at != ''){
        row.due_at = '';
        row.modified.push('due_at')
      }
      return row;
    })
    console.log(newdata)
    this.setState({data: newdata});
    this.refresh();
  }

  bulkPublish(pub){
    let data = this.state.data;
    let newdata = data.map((row)=>{
      if(row.published != pub) {
        row.modified.push('published');
        row.published = pub;
      }
      return row;
    })
    console.log(newdata);
    this.setState({data: newdata, modified: true});
    this.refresh();
  }

  render() {
    //console.log("here");console.log(data)

    // from tag for canary rows={this.state.data} rowRenderer={CustomRowRenderer}
    //<Button variant="warning" onClick={this.revert}>Revert Changes</Button>
    return (
      <div>
      <Container>
        <Row>
          <Col><h3>Modules</h3></Col>
          <Col xs={6}>

              <Button className={'bulk-actions-button'} variant="primary" onClick={this.clearAllDates}>Clear All Dates</Button>
              <Button className={'bulk-actions-button'} variant="primary" onClick={()=>this.bulkPublish(false)}>Unpublish All</Button>
              <Button className={'bulk-actions-button'} variant="primary" onClick={()=>this.bulkPublish(true)}>Publish All</Button>

          </Col>
          <Col>
            {this.state.modified &&
                        <div><Button variant="primary" className={'float-top'} onClick={this.saveToCanvas}>Save Changes</Button> </div>
              }
          </Col>
        </Row>
        <Row>
          <Col>
            <DataGrid
            columns={columns}
            rowGetter={i => this.state.data[i]}
            rowsCount={this.getRowCount()}
            rowRenderer={CustomRowRenderer}
            minHeight={(this.state.data.length*36 )+40}
            enableCellSelect={true}
            onGridRowsUpdated={this.onGridRowsUpdated}
            getCellActions={this.getCellActions}
            />
          </Col>
        </Row>
      </Container>
      <Modal show={this.state.showSaveResults} onHide={()=>{this.setState({showSaveResults: false, responses: [] })}}>
       <Modal.Header closeButton>
         <Modal.Title>Canvas Data Saved</Modal.Title>
       </Modal.Header>
       <Modal.Body>{this.state.responses.length} records were updated in Canvas</Modal.Body>
       <Modal.Footer>
         <Button variant="secondary" onClick={()=>{this.setState({showSaveResults: false, responses: [] })}}>
           Close
         </Button>
       </Modal.Footer>
     </Modal>
      </div>
    );
  }
}
//rowsCount={this.state.data.length}

export default CourseModules;
