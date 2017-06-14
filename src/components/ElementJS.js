import '../assets/css/App.css';
import React, {Component} from 'react';
import { Button, Table, FormGroup, FormControl } from 'react-bootstrap';
class ElementJS extends React.Component {
    constructor() {
        super()
    }
    render() {
      let workingText = []
      let text = ''
      const elements = this.props.elements
      for (let i = 0; i < elements.length; i++) {
        /* let objectKey = elements[i].selector
        objectKey = objectKey.replace(/[#_().>:-]/g,' ')
        objectKey = objectKey.toCamelCase().replace(/[ ]/g,'') */
        let selector = elements[i].selector
        let name = elements[i].name
        workingText.push(`/* console.log('objectKey: ${name}'); $$('${selector}') */
    ${name}: {get: function () { return browser.element('${selector}'); }}`)
      }
      text = workingText.join(',\n    ')
      const pageObjectText = `'use strict';
// lib/route/object-name.page.js
/*
    global browser
*/
let Page = require('../page');
let objectName = Object.create(Page, {
    ${text}
});
module.exports = objectName;
`
      return(
        <form>
          <FormGroup>
            <FormControl componentClass="textarea" placeholder="Hey there" value={pageObjectText}/>
          </FormGroup>
        </form>
      )
    }
}

export default ElementJS;
