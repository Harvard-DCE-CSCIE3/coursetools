import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';

class DatePickerFormatter extends Component {
   constructor(props){
     super(props);
     this.state = {
       row: props.row,
       value: props.value,
       focused: true,
       date: null,
       handleDateChange: props.handleDateChange
     }
     this.handleDateChange = this.handleDateChange.bind(this);
   }

  componentDidMount() {
    if  (this.state.row && this.state.row[this.props.col]){
      this.setState( {date: moment(this.state.row[this.props.col]).toDate()} );
    }
  }

  handleDateChange(date){
    this.state.row[this.props.col] = (date && date.toISOString()) || '';
    console.log("updated date: " + this.state.row[this.props.col])
    this.state.row.handleDateChange(date, this.props.col, this.state.row);
    // set the local state so that the field updates
    this.setState({date: date});
  }

  componentWillReceiveProps(nextProps) {
      // if there's a new date value, use it
      if  (nextProps.row && nextProps.row[this.props.col]){
        this.setState({ date: moment(nextProps.row[this.props.col]).toDate(), row: nextProps.row });
      }else{
        // otherwise, set date to null
        this.setState({ date: null, row: nextProps.row });
      }
  }

  render(){
    let type = this.state.row && this.state.row.type;
    let id = (this.state.row && this.state.row.id) || null;
    // skip due_at for modules - does not apply
    if (type=='Module' && this.props.col=='due_at'){
      return <span></span>
    }
    if (type=='Module' || type=='Assignment' || type=='Quiz' || type=='Discussion'){
      return (<DatePicker
              id={this.props.col + id}
              selected={this.state.date}
              onChange={date => this.handleDateChange(date)}
              portalId="root-portal"
              monthsShown={1}
              showTimeSelect
              className={(this.state.row.modified && this.state.row.modified.includes(this.props.col)) ? 'edited_cell' : '' }
              timeFormat="HH:mm"
              timeIntervals={60}
              shouldCloseOnSelect={true}
              injectTimes={[
                setHours(setMinutes(new Date(), 59), 23)
              ]}
              dateFormat="MM/dd/yyyy h:mm aa"
              popperModifiers={{
                offset: {
                  enabled: true,
                  offset: "5px, 10px"
                },
                preventOverflow: {
                  enabled: true,
                  escapeWithReference: false,
                  boundariesElement: "viewport"
                }
              }}
              />
            );
      }else{
          return <span></span>
      }
    }

}
// see if this even runs...
//class DatePickerFormatterUnlock extends DatePickerFormatter{
/*  constructor(props){
    let p =  Object.assign({}, props);
    p.key = 'unlock_at';
    console.log(p);
    super(p);
  }
}*/

class DatePickerFormatterUnlock extends React.Component {
    render() {
        return <DatePickerFormatter {...this.props} col="unlock_at" />;
    }
}
class DatePickerFormatterDue extends React.Component {
    render() {
        return <DatePickerFormatter {...this.props} col="due_at" />;
    }
}


export { DatePickerFormatter, DatePickerFormatterUnlock, DatePickerFormatterDue };
