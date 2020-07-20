// Header.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, Link } from 'react-router-dom';
import CourseInfo from './CourseInfo';
import CourseModules from './CourseModules';
import CourseAssignments from './CourseAssignments';
import { Navbar, Nav, NavDropdown, Container, Row, Col  } from 'react-bootstrap';


// Import caccl
import initCACCL from 'caccl/client/cached';

const { api, getStatus } = initCACCL();

class Course extends Component {

  constructor(props){
    super(props);
    this.state = {
      course: {
        account: {},
        term: {},
        sections: [],
        teachers: [],
        students: [],
        enrollments: [],
        modules: [],
        name: '',
      },
      courseId: props.match.params.number,
    }
  }

  /**
   * Called when the component mounted, pulls state and user profile from server
   */
  async componentDidMount() {
    try{
      let course = await api.course.get({
        courseId: this.state.courseId,
        includeSyllabus: true,
        includeTerm: true,
        includeAccount: true,
        includeDescription: true,
        includeSections: true,
        includeTeachers: true,
        includeCourseImage: true,
        includeNeedsGradingCount: true,
      });
      console.log(course);
      let modules = await api.other.endpoint({
        path: '/api/v1/courses/'+ this.state.courseId +'/modules',
        method: 'GET',
        params:{
          'include': ['items','content_details'],
        },
      });
      course.modules = modules;
      let assignments = await api.course.assignment.list({
        courseId: this.state.courseId,
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
        courseId: this.state.courseId,
        includeEnrollments: true,
      })
      course.students = students;
/*      let teachers = await api.course.listTeachers({
        courseId: this.state.courseId,
        includeEnrollments: true,
      })
      course.teachers = teachers; */
      this.setState({course: course});
    } catch (err) {
        return this.setState({
          message: `Error while retrieving course: ${err.message}`,
        });
    } //end catch
  }

  render() {
    return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand>CourseTools</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href={process.env.REACT_APP_BASE_URL + '/course/' + this.props.match.params.number+ '/info'}>Course Info</Nav.Link>
            <Nav.Link href={process.env.REACT_APP_BASE_URL + '/course/' + this.props.match.params.number+ '/modules'}>Course Modules</Nav.Link>
            <Nav.Link href={process.env.REACT_APP_BASE_URL + '/course/' + this.props.match.params.number+ '/assignments'}>Course Assignments</Nav.Link>
          </Nav>
          <Navbar.Text>
            <b>Course Title:</b> {this.state.course.name} <b>Course ID:</b> {this.props.match.params.number}
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
        <Switch>
            <Route exact path='/course/:number'>
              <CourseInfo number={this.props.match.params.number} course={this.state.course}/>
            </Route>
            <Route exact path='/course/:number/info'>
              <CourseInfo number={this.props.match.params.number} course={this.state.course}/>
            </Route>
            <Route exact path='/course/:number/modules'>
                <CourseModules  course={this.state.course}/>
             </Route>
            <Route exact path='/course/:number/assignments'>
              <CourseAssignments course={this.state.course}/>
            </Route>
        </Switch>
      </div>
    );
  }
}

export default Course;
