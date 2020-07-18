// Header.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import AppCourseListSelector from './AppCourseListSelector';
import Course from './Course';
import CourseGroup from './CourseGroup';
import { Switch, Route } from 'react-router-dom';


class Main extends Component {

  constructor(props){
    super(props);
    this.state ={
      groupSelection: [],
    }
    this.onGroupSelectionChanged = this.onGroupSelectionChanged.bind(this);
  }

  onGroupSelectionChanged(selection){
    console.log('changed in main');
    console.log(selection);
    this.setState({groupSelection: selection,});
  }

  render() {
    return (
    <main>
     <Switch>
        <Route exact path='/' >
          <AppCourseListSelector groupSelectionChange={this.onGroupSelectionChanged}/>
        </Route>
        {/* both /roster and /roster/:number begin with /roster
        <Route path='/roster' component={Roster}/>
        <Route path='/schedule' component={Schedule}/>
        */ }
        <Route path='/course/:number' component={Course}/>
        <Route path='/group/:number' component={CourseGroup} />
      </Switch>
    </main>
    );
  }
}

export default Main;
