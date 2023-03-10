# formit
Easy-to-use but configurable JavaScript plugin to make creating and reading forms less of a pain in the ass

## Overview
### Purpose
This plugin was primarily built for simple static webpages that take form data -- calculators, generators, surveys, etc. -- to make the process of quickly adding, validating, and parsing inputs easy
### Features
- easily generate a form from a basic JavaScript primitives
- or fine-tune your form with included functions like `slider`, `radio`, and `textArea`
- add input-specific or form-wide validation
- add hide & lock conditions to prevent malformed data
- add input transformers to change the input before it is passed to a 
- register a callback function to the form that receives all the parsed for data on update (assuming inputs are valid)
- A11y-compliant

### Basic example
```javascript
// get some element to put the form in
const formContainer = document.findElementById("form-container");

// create and append the form to formContainer
formContainer.appendChild(form(
    // provide an ID for the form to use
    "test-form",
    // form data
    {
        textInput: "Placeholder Text",
        slider: slider(0, 10),
    }
).onChange((data) => {
    // logs the respective textInput and slider values each time either is changed
    console.log(data.textInput);
    console.log(data.slider);
})
```

## Docs
Most JavaScript Primitives are supported by formit's `form` function. Below is an example for the main primitive types

```js
form(
    "test-form",
    {
        test0: true,          // creates a checkbox with default "checked" state as given. On update returns the state of the checkbox (true or false)
        
        test1: 1,             // creates an input:number element with Default value as given. On update returns a parsed number (supports decimals)
        
        test2: "Example",     // creates an input:text element with placeholder text as given. On update returns the contents as a string
        
        test3: [1, 2, 3],     // creates a group of checkboxes with labels 1, 2, and 3. All are disabled by default
                              // On update returns an array of selected names. Names are returned as strings
                              // example: ["1", "3"] would be returned if the first and last checkbox are selected
                              
        test4: slider(0, 10), // creates a slider input element with min value 0, max value of 10
        
        test5: radio(["one", "two", "three"]), // creates a group of radio buttons with the given values as names
                                               // the first is selected by default
                                               // On update returns the name of the selected radio button
                                               
        test6: checkbox(["one", "two", "three"]), // creates a group of checkboxes with the given values as names
                                                  // identical to providing an array but allows more config options
        
        // Note: due to stateless nature of buttons, they are not included in the returned onUpdate info
        // When buttons are pressed, the main callback function is still invoked
        test7: () => { console.log("button press") }, // creates a button with the onClick function as defined
        test8: (formData, name, element, form) => { console.log(name); }, // the onUpdate info, button text name, button element, and form element are all passed into the callback function

        "Name with spaces or %special chars%": true, // remember you can define strings as object keys if you want input labels/text that are not legal JS syntax
        
        test9: textArea("placeholder text", rows=10, cols=15, resize=true), // creates a textarea with the given parameters
    }
)
```


## Notes

This repo also contains two style sheets:
 - layout.min.css : a style sheet to improve the default layout of a form, making it fill its container
 - custom.min.css : a style sheet that replaces the unmodifiable default look of input elements with custom styles
