var React = require('react');
var ReactDOM = require('react-dom');
var ReactDraggable = require('react-draggable');

var Note = React.createClass({
  // returns initial state of the app,
  // so when the app is loaded, we see the note
  getInitialState() {
    return { editing: false }
  },

  //fires right before the render and sets a style
  //on a new Note using randomBetween()
  componentWillMount() {
    this.style = {
      right: this.randomBetween(0, window.innerWidth - 150, 'px'),
      top: this.randomBetween(0, window.innerHeight - 150, 'px')
    };
  },

  //if note was updated, during editing state we give textare focus
  //and make all text selected
  componentDidUpdate() {
    if (this.state.editing) {
      this.refs.newText.focus();
      this.refs.newText.select();
    }
  },

  //if note wasn't updated,we don't want to re-render,
  //we want to just go to the previous state without re-rendering
  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.props.children !== nextProps.children || this.state !== nextState;
  // },

  //generates a random number
  //here x and y represent x and y axes
  randomBetween(x, y, units) {
    return (x + Math.ceil(Math.random() * (y - x))) + units
  },

  edit() {
    this.setState({ editing: true });
  },

  save() {
    var val = this.refs.newText.value;
    this.props.onChange(val, this.props.id);
    this.setState({ editing: false });
  },

  // rename this into delete
  remove() {
    this.props.onRemove(this.props.id);
  },

  // displays the note
  renderDisplay() {
    return (
      <div className="note" style={this.style}>
        <p>{this.props.children}</p>
        <span>
          <button onClick={this.edit}>EDIT</button>
          <button onClick={this.remove}>X</button>
        </span>
      </div>
    )
  },

  //displays editing state of the note
  renderForm() {
    return (
      <div className="note" style={this.style}>
        {/* added defaultValue so when note is being edited, original text
        is still displayed in text area */}
        <textarea ref="newText" defaultValue={this.props.children}></textarea>
        <button onClick={this.save}>SAVE</button>
      </div>
    )
  },

  render() {
    return (
      <ReactDraggable>
        {(this.state.editing) ? this.renderForm() : this.renderDisplay()}
      </ReactDraggable>
    );
  }
});

var Board = React.createClass({
  propTypes: {
    count: function(props, propName) {
      if (typeof props[propName] !== "number") {
        return new Error("Count must be a number");
      }
      if (props[propName] > 100) {
        return new Error(props[propName] + " is too many notes! Must be less than 100");
      }
    }
  },

  getInitialState() {
    return {
      notes: []
    }
  },

  componentWillMount() {
    if (this.props.count) {
      var url = `http://baconipsum.com/api/?type=all-meat&sentences=${this.props.count}`;
      fetch(url)
        .then(results => results.json())
        .then(array => array[0])
        .then(text => text.split('. '))
        .then(array => array.forEach(
          sentence => this.add(sentence)
        ))
        .catch(function(err) {
          console.log('Didnt connect to the API', err);
        })
    }
  },

  //method to generate new ids used in addNote method
  nextId() {
    this.uniqueId = this.uniqueId || 0
    return this.uniqueId++;
  },

  // rename into addNote
  add(text) {
    var notes = [
      ...this.state.notes,
      {
        id: this.nextId(),
        note: text
      }
    ];
    this.setState({ notes });
  },

  update(newText, id) {
    var notes = this.state.notes.map(
      note => (note.id !== id) ?
        note :
        {
          ...note,
          note: newText
        }
    )
    this.setState({ notes });
  },

  remove(id) {
    var notes = this.state.notes.filter(note => note.id !== id);
    this.setState({ notes });
  },

  eachNote(note) {
    return (
      <Note key={note.id}
            id={note.id}
            onChange={this.update}
            onRemove={this.remove}>
        {note.note}
      </Note>
    )
  },

  render() {
    return(
      <div className="board">
        {/* maps over notes array from getInitialState() */}
        {this.state.notes.map(this.eachNote)}
        <button onClick={() => this.add('New Note')}>Add Note</button>
      </div>
    )
  }
});

ReactDOM.render(
  <Board count={10} />,
  document.getElementById('app')
);
