/*
  global chrome
 */
import React, { Component } from 'react';
import { Tab, Tabs, Button, ButtonToolbar } from 'react-bootstrap';
import ElementForm from './ElementForm';
import ElementJS from './ElementJS';
import '../assets/css/App.css';

const statusList = {
  IDLE: 'IDLE',
  ATTACHED: 'ATTACHED'
};

class App extends Component {
    constructor() {
        super();
        this.state = {
          key: 1,
          status: statusList.IDLE,
          elements: []
        };
        this.handleAttach = this.handleAttach.bind(this);
        this.handleDetach = this.handleDetach.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.drawButtons = this.drawButtons.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
    }

    componentDidMount() {
      chrome.runtime.sendMessage({ getObject: true }, (response) => {
          this.setState({ elements: response.map });
        }
      );

      const currentStatus = window.localStorage.getItem('PAGE_OBJECT_STATUS');
      if (currentStatus === statusList.ATTACHED) {
        chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          const arrayFill = [];
          const id = tabs[0].id;
          console.log('id %s', id);
          let existingEntries = window.localStorage.getItem('PAGE_OBJECT_ACTIVE_TABS') || JSON.stringify(arrayFill);
          existingEntries = JSON.parse(existingEntries);
          for (let i = existingEntries.length - 1; i >= 0; i--) {
            if (existingEntries[i] === id) {
              this.state.status = statusList.ATTACHED;
              break;
            }
          }
          existingEntries = JSON.stringify(existingEntries);
          window.localStorage.setItem('PAGE_OBJECT_ACTIVE_TABS', existingEntries);
          this.onNextFrame(this.fadeElement);
        });
      } else {
        this.onNextFrame(this.fadeElement);
      }
    }

    onNextFrame(callback) {
        setTimeout(function () {
            window.requestAnimationFrame(callback);
        }, 0);
    }

    fadeElement() {
        document.body.className = 'visible';
    }

    handleDeleteClick(e) {
      const elements = this.state.elements;
      let rm = e.target.id;
      if (e.target.nodeName === 'SPAN') {
        rm = e.target.parentElement.id;
      }
      rm = rm.replace('delete-element-', '');
      elements.splice(rm, 1);
      window.localStorage.setItem('PAGE_OBJECT_ELEMENTS', elementString);
      this.setState({ elements: elements });
    }

    handleChange(e) {
      const elements = this.state.elements;
      const commandId = e.target.id;
      const items = commandId.split('-');
      const index = items[items.length - 1];
      if (commandId.startsWith('element-name-')) {
        elements[index] = {
          name: e.target.value,
          selector: elements[index].selector
        };
      } else if (commandId.startsWith('element-selector-')) {
        elements[index] = {
          name: elements[index].name,
          selector: e.target.value
        };
      }
      const elementString = JSON.stringify(elements);
      const newState = {};
      newState.elements = elements;
      window.localStorage.setItem('PAGE_OBJECT_ELEMENTS', elementString);
      this.setState(newState);
    }

    handleAttach() {
      this.setState({ status: statusList.ATTACHED });
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const arrayFill = [];
        const id = tabs[0].id;
        let existingEntries = window.localStorage.getItem('PAGE_OBJECT_ACTIVE_TABS') || JSON.stringify(arrayFill);
        existingEntries = JSON.parse(existingEntries);
        existingEntries.push(id);
        existingEntries = JSON.stringify(existingEntries);
        window.localStorage.setItem('PAGE_OBJECT_ACTIVE_TABS', existingEntries);
        chrome.tabs.executeScript(null, { file: 'selector.js' });
        // TODO disable the thing that doesnt like this
        chrome.tabs.executeScript(null, { code: 'var all = document.getElementsByTagName(\'*\');\
          function inspectClick(e) {\
            e.stopPropagation();\
            e.preventDefault();\
            chrome.runtime.sendMessage({selector: UTILS.cssPath(e.target), putObject: true}, function(response) {\
              console.log(\'Captured: \' + response.selector);});\
          }\
          for (var i=0, max=all.length; i < max; i++) {\
            all[i].addEventListener(\'click\', inspectClick)\
          }'
        });
        window.localStorage.setItem('PAGE_OBJECT_STATUS', statusList.ATTACHED);
        window.close();
      });
    }

    handleDetach() {
      this.setState({ status: statusList.IDLE });
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const arrayFill = [];
        const id = tabs[0].id;
        let existingEntries = window.localStorage.getItem('PAGE_OBJECT_ACTIVE_TABS') || JSON.stringify(arrayFill);
        existingEntries = JSON.parse(existingEntries);
        for (let i = existingEntries.length - 1; i >= 0; i--) {
          if (existingEntries[i] === id) {
            existingEntries.splice(i, 1);
            i--;
          }
        }
        if (existingEntries.length === 0) {
          window.localStorage.setItem('PAGE_OBJECT_STATUS', statusList.IDLE);
        }
        existingEntries = JSON.stringify(existingEntries);
        window.localStorage.setItem('PAGE_OBJECT_ACTIVE_TABS', existingEntries);
        chrome.tabs.executeScript(null, { code: 'var all = document.getElementsByTagName(\'*\');\
          for (var i=0, max=all.length; i < max; i++) {\
            all[i].removeEventListener(\'click\', inspectClick)\
          }'
        });
        window.close();
      });
    }

    handleSelect(key) {
      const newState = {};
      newState.key = key;
      this.setState(newState);
    }

    handleReset() {
      const elements = [];
      const elementString = JSON.stringify(elements);
      window.localStorage.setItem('PAGE_OBJECT_ELEMENTS', elementString);
      // const currentStatus = window.localStorage.getItem('PAGE_OBJECT_STATUS');
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          const arrayFill = [];
          const id = tabs[0].id;
          let existingEntries = window.localStorage.getItem('PAGE_OBJECT_ACTIVE_TABS') || JSON.stringify(arrayFill);
          existingEntries = JSON.parse(existingEntries);
          for (let i = existingEntries.length - 1; i >= 0; i--) {
            if (existingEntries[i] === id) {
              const newState = {};
              newState.status = statusList.ATTACHED;
              newState.elements = elements;
              this.setState(newState);
              break;
            }
          }
          this.onNextFrame(this.fadeElement);
      });
    }

    drawButtons() {
      if (this.state.status === statusList.IDLE) {
          return (<ButtonToolbar id={'controls'}>
            <Button bsStyle="primary" onClick={this.handleAttach}>Attach</Button>
            <Button onClick={this.handleReset}>Reset</Button>
          </ButtonToolbar>);
      } else if (this.state.status === statusList.ATTACHED) {
          return (<ButtonToolbar id={'controls'}>
            <Button bsStyle="primary" onClick={this.handleDetach}>Detach</Button>
            <Button onClick={this.handleReset}>Reset</Button>
          </ButtonToolbar>);
      }
    }
    render() {
        return (<div className={'container-fluid'} id="main-wrapper">
<div className={'row'}>
  <Tabs activeKey={this.state.key} onSelect={this.handleSelect} id="controlled-tab-example">
    <Tab eventKey={1} title="Elements">
    <ElementForm
        handleChange={this.handleChange}
        handleDeleteClick={this.handleDeleteClick}
        getValidationState={this.getValidationState}
        elements={this.state.elements}
    />
    </Tab>
    <Tab eventKey={2} title="Page Object">
      <ElementJS
        elements={this.state.elements}
      />
    </Tab>
  </Tabs>
</div>

<div className={'row'}>
  {this.drawButtons()}
</div>
</div>);
    }
}

export default App;
