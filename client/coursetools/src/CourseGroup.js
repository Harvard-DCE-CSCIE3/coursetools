// Header.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, Link } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container, Row, Col  } from 'react-bootstrap';
import GroupPersistService from './util/GroupPersistService'
import DataGrid from 'react-data-grid';
import BootstrapTable from 'react-bootstrap-table-next';
import StudentAccess from './analytics/StudentAccess';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faSync } from '@fortawesome/free-solid-svg-icons'
import Cog from 'dce-reactkit/lib/glyph/Cog';



// Import caccl
import initCACCL from 'caccl/client/cached';

const { api, getStatus } = initCACCL();

/* const columns = [
  { key: "id", name: "Actions", width: 75, resizeable: false,},
  { key: "name", name: "Name", width: 400, resizeable: true, editable: true, },
  { key: "workflow_state", name: "Published", width: 100, resizeable: true, },
  { key: "modules-open-total", name: "Modules (Open/Total)", width: 100, resizeable: true, },
  { key: "total_students", name: "Number of Students", width: 100,  resizeable: true, },
  { key: "teachers", name: "Instructor", width: 100, formatter: InstructorFormatter, resizeable: true, }, ///
  { key: "instructor_login_days", name: "Instructor: Last Visited (days)", width: 100, resizeable: true, },

];*/

const columns = [
  { dataField: 'id', text: 'ID', formatter: CourseIdFormatter, headerStyle:  { width: '75px', },},
  { dataField: 'name', text: 'Name', headerStyle: { width: '300px', },},
  { dataField: 'workflow_state',text: 'Published', headerStyle: { width: '100px',} },
  { dataField: "modules-open-total", formatter: ModulesFormatter, text: "Modules (Open/ Total)", resizeable: true, headerStyle: { width: '80px', }, },
  { dataField: "teachers", text: "Instructor (Last Visit)",  formatter: InstructorFormatter, resizeable: true,  }, ///
  { dataField: "total_students", text: "Number of Students",  headerStyle: { width: '80px', }, resizeable: true, },
  { dataField: "instructor_login_days", formatter: ActivityFormatter, text: "Activity Info", width: 100, resizeable: true, },
];

let canvasHost = '';

function days_between(date1, date2) {

    // The number of milliseconds in one day
    const ONE_DAY = 1000 * 60 * 60 * 24;

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(date1 - date2);

    // Convert back to days and return
    return Math.round(differenceMs / ONE_DAY);

}

function ActivityFormatter(cell, el, index){
  let s = '';
  let sa = new StudentAccess(el.students);
  //Accessed: {sa.studentsAccessed.length}<br />
  return (<div>
    Never Accessed: {sa.studentsNeverAccessed.length}<br />
    Avg Days Since Access: {sa.meanLastAccess}<br />
    Median Since Access: {sa.medianLastAccess}<br />
  </div>)
}

function InstructorFormatter(cell, el, index){
  let s = '';
  return (<div>
    {el.teachers.map((val, index) => {
        let lastAccess = val.enrollments[0].last_activity_at;
        let daysSinceActivity = days_between(Date.now(), new Date(lastAccess));
        return <div key={val.id}><a href={'https://' + canvasHost + '/courses/' + el.id + '/users/' +val.id} target="_blank" title='Open user page in Canvas (in a new tab)'>{val.name}</a> ({daysSinceActivity} days) <br /></div>
      })}
  </div>)
}
function CourseIdFormatter(cell, el, index){
  return <a href={'https://' + canvasHost + '/courses/' +el.id} target="_blank" title='Open in Canvas (in a new tab)'>{el.id}</a>
}
function ModulesFormatter(cell, el, index ){
  return <div>{el.modules.reduce((acc, el)=>{return el.published ? ++acc : acc }, 0)} of {el.modules.length} <a href={'/course/' + el.id + '/modules'} target="_blank" title="Open CourseTools Modules (opens in a new tab)"><Cog /></a></div>
}

class CourseGroup extends Component{

  constructor(props){
    super(props);
    this.state = {
      courseGroup: GroupPersistService.getCourseGroup(props.match.params.number),
      groupId: props.match.params.number,
      tabledata: [],
      data: [],
    }
  }
  /**
  Condenses rich course data into flattened strucutre that is passed to the table
  on this page.
  **/
  flattenCourseData(course){
    let row = course;
    row.total_students = (course.students && course.students.length) || ''

    return row;
  }

  /**
   * Called when the component mounted, pulls state and user profile from server
   */
  async componentDidMount() {
    // fetch the course data:
    // all data:
      // course details, module details, student details

      console.log('did mount');

      const response = fetch('/config', {credentials: 'include',}).then(async function (response){  // dev problem - locahost
        console.log(response);
        const json = await response.json();
        canvasHost = json.canvasHost;
      });

      console.log(this.state.courseGroup)
      try{
        // fetch course information
        /*const response = await fetch('https://localhost/config', {credentials: 'include',});
        console.log(response);
        const json = await response.json();
        let canvasHost = json.canvasHost;
        */
        for(let i=0; i<this.state.courseGroup.length; i++){
          let courseId = this.state.courseGroup[i].id;
          let course = await api.course.get({
            courseId: courseId,
            includeSyllabus: true,
            includeTerm: true,
            includeAccount: true,
            includeDescription: true,
            includeSections: true,
            includeCourseImage: true,
            includeNeedsGradingCount: true,
          });
          console.log(course);
          let modules = await api.other.endpoint({
            path: '/api/v1/courses/'+ courseId +'/modules',
            method: 'GET',
            params:{
              'include': ['items','content_details'],
            },
          });
          course.modules = modules;
          let assignments = await api.course.assignment.list({
            courseId: courseId,
          });
          let assnType = assignments.map(el => {
            if (el.discussion_topic){
              el.type = 'Discussion';
            }else {
             el.type = 'Assignment';
           }
            return el;
          });
          course.assignments = assnType;
          let students = await api.course.listStudents({
            courseId: courseId,
            includeEnrollments: true,
          })
          course.students = students;
          let teachers = await api.course.listTeachers({
            courseId: courseId,
            includeEnrollments: true,
          })
          course.teachers = teachers;
          let data = this.state.data;
          data.push(course);
          this.setState({data: data});

          let tabledata = this.state.tabledata;
          tabledata.push(this.flattenCourseData(course));
          this.setState({data: data, tabledata: tabledata},);
        }
      } catch (err) {
          return this.setState({
            message: `Error while retrieving course: ${err.message}`,
          });
      } //end catch
  }

  getRowCount(){
    return this.state.tabledata.length;
  }

  render() {
    return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand>CourseGroupTools</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href={'info'}>Course Group Info</Nav.Link>
          </Nav>
          <Navbar.Text>
             <b>CourseGroup ID:</b> {this.props.match.params.number}
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
        <Switch>
            <Route exact path='/group/:number'>
              <Container>
              <Row>
                <Col>
                <BootstrapTable
                  keyField='id'
                  data={ this.state.tabledata}
                  columns={ columns }
                  striped
                  hover
                  condensed
                  />
                </Col>
              </Row>
              </Container>
            </Route>
            <Route exact path='/group/:number/info'>  // fix this - new component
              <Container>
              <Row>
                <Col>
                <BootstrapTable
                  keyField='id'
                  data={ this.state.tabledata}
                  columns={ columns }
                  striped
                  hover
                  condensed
                  />
                </Col>
              </Row>
              </Container>
            </Route>
        </Switch>
      </div>
    );
  }
}

export default CourseGroup;
//<CourseGroupInfo number={this.props.match.params.number} course={this.state.courseGroup}/>
/* <DataGrid
columns={columns}
rowGetter={i => this.state.tabledata[i]}
rowsCount={this.getRowCount()}
minHeight={(this.state.tabledata.length*36 )+40}
/>
*/
