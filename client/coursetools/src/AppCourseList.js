// Import caccl
import initCACCL from 'caccl/client/cached';

// Import React
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import Table from './TableCourseList.js'
import * as moment from 'moment-timezone'

// Import resources
import logo from './logo.svg';
import './App.css';

// Initialize caccl
const { api, getStatus } = initCACCL();

class App extends Component {
  /**
   * Initialize App component
   */
  constructor(props) {
    super(props);


    // Set up state
    this.state = {
      message: 'Loading! Just a moment...',
      courses: [{id:'',name:'',term:'', workflow_state:'',start_at:''}],
      accountid: '',
      loading: false,
    };
    this.handleAccountChange = this.handleAccountChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleAccountChange(event) {
      this.setState({accountid: event.target.value});
  }

  async handleSubmit(event){
      // Load profile information
      //alert('An id was submitted: ' + this.state.accountid);
      event.preventDefault();

      // here pass message to ag-grid to gridOptions.api.showLoadingOverlay()
      this.setState({loading: true,});

      try {
        // Get profile from Canvas via api
        let accountid = this.state.accountid;
        let terms = await api.account.enrollmentTerm.list({accountId: 1});
        let courses = await api.account.listCourses({
            includeTotalStudents: true,
            accountId: accountid,
            includeTerm: true,
          });
        // Update state
        console.log("output");
        console.log(accountid);
        console.log(terms);
        courses.forEach((el)=>{
          el.term = this.lookupTermName(el.enrollment_term_id, terms);
        });
        console.log(courses);
        //modules = {rows: modules};
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

      // Update state
      console.log("output");
      console.log(profile);
      //modules = {rows: modules};
      return this.setState({
        message: `Hi ${profile.name}! Your CACCL app is ready!`,
      });
    } catch (err) {
      return this.setState({
        message: `Error while requesting user profile: ${err.message}`,
      });
    }
  }


  /**
   * Render the App
   */
  render() {
    // Deconstruct the state
    const { message, courses, terms, loading } = this.state;


    // Render the component
    return (
      <div className="App">
        <header className="App-header">
          <p>
            <strong>{message}</strong>
          </p>

            <form onSubmit={this.handleSubmit}>
              <label>
                Account ID:  <input type="text" value={this.state.accountid} onChange={this.handleAccountChange} />
              </label>
              <input type="submit" value="Submit"/>
            </form>

          <div className="container">
            { /* modules && modules.map((mod) => (
              <li key={mod.id}>
                {mod.name}
              </li>
            )) */ }
            <Table courses= { courses }
                   loading = { loading } />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
