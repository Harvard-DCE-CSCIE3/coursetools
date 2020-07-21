// Import caccl
import initCACCL from 'caccl/client/cached';

// Import React
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import Table from './TableCourseList.js'
import Course from './Course';
import Select from 'react-select';
import { Navbar, Nav, NavDropdown, Container, Row, Col, Button, Form  } from 'react-bootstrap';
import { Switch, Route, Link } from 'react-router-dom';
import GroupPersistService from './util/GroupPersistService';

// Import resources
import logo from './logo.svg';
import './App.css';

// Initialize caccl

const { api, getStatus } = initCACCL();

function SelectList(props) {
    const list = props.list || [];
    console.log("list");console.log(list);
    const listItems = list.map((item) =>
      <option value={item.id.toString()}>
        {item.name}
      </option>
    );
    if (props.includeEmptyOption){
      listItems.unshift({id: '', name: '',});
    }
    return listItems
  }


class App extends Component {
  /**
   * Initialize App component
   */
  constructor(props) {
    super(props);


    // Set up state
    this.state = {
      message: 'Loading! Just a moment...',
      courses: [],
      accountid: '',
      account_name: '',
      loading: false,
      accounts: [{id:'',name:'',}],
      terms: [{id:'',name:'',}],
      keyword: '',
      termid: '',
      selected: [],
      groupId: '',
    };
    this.handleAccountChange = this.handleAccountChange.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);
    this.openCourseGroup = this.openCourseGroup.bind(this);
  }

  handleAccountChange(event) {
      this.setState({accountid: event.target.value});
  }
  handleTermChange(event) {
      this.setState({termid: event.target.value});
  }
  handleKeywordChange(event) {
      this.setState({keyword: event.target.value});
  }
/*
    handleAccountChange(value) {
        this.setState({accountid: value});
    }
    handleTermChange(value) {
          this.setState({termid: value});
      }
*/
  async handleSubmit(event){
      // stop HTML form submission
      event.preventDefault();

      // here pass message to ag-grid to gridOptions.api.showLoadingOverlay()
      this.setState({loading: true,});

      try {
        // Get profile from Canvas via api
        // let accountid = this.state.accountid;
        let accountid = event.target.account.value;
        let termid = event.target.term.value;
        this.setState({accountid: accountid, termid: termid,});
        let terms =  this.state.terms; //await api.account.enrollmentTerm.list({accountId: 1});

        let courses = [];
        if (accountid){
          courses = await api.account.listCourses({
              includeTotalStudents: true,
              accountId: accountid,
              includeAccountName: true,
              includeTerm: true,
              enrollmentTermId: termid || '',
              searchTerm: event.target.keyword.value,
            });
        }else{
          courses = await api.user.self.listCourses({
              includeTotalStudents: true,
              includeAccountName: true,
              includeTerm: true,
            });
            courses = await api.other.endpoint({
                path: '/api/v1/courses/',
                method: 'GET',
                params:{
                  'include': ['term','account','total_students','needs_grading_count'],
                },
              });

        }

        // Update state
        courses.forEach((el)=>{
          el.term = this.lookupTermName(el.enrollment_term_id, terms);
        });
        //console.log(courses);
        // here hide overlay
        return this.setState({
          courses:courses,
          terms: terms,
          loading: false,
        });
      } catch (err) {
        // here hide overlay and apass error to ag-grid
        this.setState({loading: false,});
        return this.setState({
          message: `Error while requesting user profile: ${err.message}`,
        });
      }
    }

    lookupTermName(id, terms){
      for (let i=0; i< terms.length; i++){
        if (id == terms[i].id){
          return terms[i].name;
        }
      }
    }

  /**
   * Called when the component mounted, pulls state and user profile from server
   */
  async componentDidMount() {

    // Load profile information
    try {
      // Get profile from Canvas via api
      let profile = await api.user.self.getProfile();

      // get list of accounts for this user
      let acc = await api.account.list();
      let accounts = acc.map(el => {
        return {
          id: el.id,
          name: el.name,
          label: el.name,
          value: el.id,
        }
      });
      console.log("didMount accounts");
      console.log(accounts);
      // get list of terms for all accounts
      let tms = await api.account.enrollmentTerm.list({accountId: '1'});
      tms.unshift({id:'',name:'',})
      let terms = tms.map(el => {
        return {
          id: el.id,
          name: el.name,
          label: el.name,
          value: el.id,
        }
      });
      terms = terms.sort((a, b)=>{
        if (a.name == 'Default Term') { return -1; }
        if (b.name == 'Default Term') { return 1; }

        if (a.name < b.name) {return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      })

      const response = await fetch(process.env.REACT_APP_SERVER_URL_PREFIX + 'config', {credentials: 'include',});  // this is a problem for dev
      console.log(response);
      const json = await response.json();
      let canvasHost = json.canvasHost;
      console.log("didMount terms");
      console.log(canvasHost);
      console.log(terms);

      // Update state
      console.log("output");
      console.log(profile);
      //modules = {rows: modules};
      return this.setState({
        message: `Hello ${profile.name}!`,
        accounts: accounts,
        terms: terms,
        canvasHost: canvasHost,
      });
    } catch (err) {
      return this.setState({
        message: `Error while requesting user profile: ${err.message}`,
      });
    }
  }

  onSelectionChanged(list){
    console.log("changed in app course list")
    let now = Date.now();
    this.setState({selected: list, groupId: now, });
    //this.props.groupSelectionChange(list);
  }

  openCourseGroup(e){
    //console.log(this.state.selected);
    // here we'd save the course group from this.state.selected
    // then follow the link
    e.preventDefault();

    let now = Date.now();
    let list = this.state.selected;
    GroupPersistService.saveCourseGroup(list, now);
    e.persist();

    this.setState({ selected: list, groupId: now, }, ()=>{
      //this.props.groupSelectionChange(list);
      e.target.dispatchEvent(new MouseEvent("click"));
    });

  }
  /**
   * Render the App
   */
  render() {
    // Deconstruct the state
    const { message, courses, terms, loading, canvasHost } = this.state;
    console.log("state");
    console.log(this.state);
    console.log(canvasHost);

    const accountItems = this.state.accounts.map((acct) =>
      <option value={acct.id}>{acct.name}</option>
    );
    const termItems = this.state.terms.map((term) =>
      <option value={term.id}>{term.name}</option>
    );
    // Render the component
    return (
<div>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>CourseTools</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Form inline onSubmit={this.handleSubmit}>

            <Form.Group controlId="courselister.accountselect" className='navFormItem'>
              <Form.Label className={'navbar-dark navbar-text'}>Accounts:</Form.Label>
              <Form.Control as="select" name="account" id="account" value={this.state.accountid} onChange={this.handleAccountChange}>
                  { accountItems }
              </Form.Control>
            </Form.Group>

              <Form.Group controlId="courselister.termselect"  className='navFormItem'>
                <Form.Label className={'navbar-dark navbar-text'}>Terms:</Form.Label>
                <Form.Control as="select" name="term" id="term" value={this.state.termid} onChange={this.handleTermChange}>
                    { termItems }
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="courselister.keyword"  className='navFormItem'>
                <Form.Label className={'navbar-dark navbar-text'}>Search Term:</Form.Label>
                <Form.Control placeholder="(course title)" type="text" name="keyword" id="keyword" >

                </Form.Control>
              </Form.Group>
              <Button variant="primary" type="submit"  className='navFormItem'>
                Submit
              </Button>

          </Form>
          <Navbar.Text className='navFormItem'>
            { message }
          </Navbar.Text>
          <Navbar.Text id="resultCount" className='navFormItem'> { courses.length ? 'Courses Found: ' + courses.length : '' }</Navbar.Text>
          <Navbar.Text id="selectionCount" className='navFormItem'> { this.state.selected.length ? '  Courses Selected: ' + this.state.selected.length : ''} &nbsp;&nbsp; { this.state.selected.length ? <a href={"group/"+this.state.groupId} onClick={ this.openCourseGroup } className='btn btn-primary' target="_new">Open Course Group</a> : '' }</Navbar.Text>
        </Navbar.Collapse>
      </Navbar>




      <Container fluid className="App">

       <Row>
       <Col>


          <Switch>
              <Route exact path='/'>
                <div className="container">
                  { /* modules && modules.map((mod) => (
                    <li key={mod.id}>
                      {mod.name}
                    </li>
                  )) */ }
                  <Table courses= { courses }
                         canvasHost={ canvasHost }
                         loading = { loading }
                         onSelectionChanged = { this.onSelectionChanged } />
                </div>
              </Route>
          </Switch>



          </Col>
        </Row>
      </Container>
</div>
    );
  }
}

export default App;
