import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment';

import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';


class DatePickerEditor extends Component {
   constructor(props){
     super(props);
     this.state = {
       date: '',
       focused: true,
     }
   }


    getValue() {
    // should return an object of key/value pairs to be merged back to the row
      return{
        unlock_at: '2020-06-23',
      }
    }

  getInputNode() {
    // If applicable, should return back the primary html input node that is used to edit the data
    // Otherwise return null
    // If value is an input node, then this node will be focussed on when the editor opens
    debugger;

    return document.getElementById('unlock_at_'+this.props.rowData.id);
  }

  disableContainerStyles() {
    // Optional method
    // If set to true, the EditorContainer will not apply default styling to the editor
  }

  render(){
    return (
      <SingleDatePicker
        date={moment(this.props.value)} // momentPropTypes.momentObj or null
        onDateChange={date => this.setState({ date })} // PropTypes.func.isRequired
        focused={this.state.focused} // PropTypes.bool
        onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
        id={this.props.rowData.id + "rowidinput"} // PropTypes.string.isRequired,
        small
        orientation={'vertical'}
        numberOfMonths={3}
        />
  )};
}
// see if this even runs...


export default DatePickerEditor;
