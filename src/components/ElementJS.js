import React, { Component } from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';
import '../assets/css/App.css';

class ElementJS extends Component {
    // constructor() {
    //     super();
    // }
    render() {
      const workingText = [];
      let text = '';
      const elements = this.props.elements;
      for (let i = 0; i < elements.length; i++) {
        /* let objectKey = elements[i].selector
        objectKey = objectKey.replace(/[#_().>:-]/g,' ')
        objectKey = objectKey.toCamelCase().replace(/[ ]/g,'') */
        const selector = elements[i].selector;
        const name = elements[i].name;
        workingText.push(`/* console.log('objectKey: ${name}'); $$('${selector}') */
    ${name}: {get: function () { return browser.element('${selector}'); }}`);
      }
      text = workingText.join(',\n    ');
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
`;
      return (
        <form>
          <FormGroup>
            <FormControl componentClass="textarea" placeholder="Hey there" value={pageObjectText} />
          </FormGroup>
        </form>
      );
    }
}

export default ElementJS;
