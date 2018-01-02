import React, { Component } from 'react';
import { Button, Table, FormGroup, FormControl } from 'react-bootstrap';
import '../assets/css/App.css';

class ElementForm extends Component {
    constructor() {
        super();
        this.append = this.append.bind(this);
    }
    append(string, id) {
      return string + id;
    }
    render() {
      const elements = this.props.elements.map((e, i) => (
        <tr key={i}>
        <td><FormControl
            type="text"
            id={this.append('element-name-', i)}
            value={e.name}
            placeholder="Key"
            onChange={this.props.handleChange}
        /></td>
        <td><FormControl
            type="text"
            id={this.append('element-selector-', i)}
            value={e.selector}
            placeholder="Selector"
            onChange={this.props.handleChange}
        /></td>
        <td><Button id={this.append('delete-element-', i)} onClick={this.props.handleDeleteClick}>
                <span className="glyphicon glyphicon-trash" aria-hidden="true" />
            </Button>
        </td>
      </tr>
      ));
      return (
        <form>
          <FormGroup>
            <Table>
              <tbody>
                {elements}
              </tbody>
            </Table>
          </FormGroup>
        </form>);
    }
}

export default ElementForm;
