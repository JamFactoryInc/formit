function transform(callbacks, key, value) {
    if (callbacks[key + '-transform']) {
        return callbacks[key + '-transform'](value, key)
    }
    return value
}


function form(formId, obj, preventDefault = true) {
    const callbacks = {}
    const f = document.createElement('form')
    f.id = formId

    function change() {
        let anyFail = 0
        let arg = obj
        f.querySelectorAll('input').forEach(e => {
            const key = e.attributes.formvalue
            let ignoreCallbacks = false
            switch (e.type) {
                case "text":
                    arg[key] = transform(callbacks, key, e.value)
                    break
                case "checkbox":
                    if (typeof arg[key] === 'boolean') {
                        arg[key] = transform(callbacks, key, e.checked)
                    } else {
                        if (!arg[key].first) {
                            arg[key].first = true
                            arg[key].results = []
                        }
                        if (e.checked) {
                            arg[key].results.push(e.value)
                        }
                    }
                    break
                case "range":
                    arg[key] = transform(callbacks, key, parseInt(e.value))
                    break
                case "number":
                    arg[key] = transform(callbacks, key, parseFloat(e.value))
                    break
                case "radio":
                    if (e.checked) {
                        arg[key] = transform(callbacks, key, e.value)
                    }
            }
        })
        Object.entries(arg).forEach(([k, v]) => {
            if (v.results) {
                arg[k] = v.results
            }
        })
        if (anyFail === 0) {
            callbacks[formId](arg)
        }
    }

    function callback(fn) {
        callbacks[formId] = fn
        return f
    }

    function subChild(element, newElementType, cb) {
        const newChild = document.createElement(newElementType)
        cb(newChild)
        element.appendChild(newChild)
    }

    function handleGroupElement(child, option, i, k, proxyClass, inputType) {
        subChild(child, "span", sChild1 => {
            subChild(sChild1, "label", label => {
                label.setAttribute("for", option)
                label.textContent = option
            })
            subChild(sChild1, "span", styleContainer => {
                styleContainer.classList.add("container")
                subChild(styleContainer, "input", (checkbox) => {
                    if (i == 0) {
                        checkbox.checked = "checked"//checked
                    }
                    checkbox.type = inputType
                    checkbox.name = `${formId}-${numRadioInputs}`
                    checkbox.id = `${checkbox.name}-${option}`
                    checkbox.value = option
                    checkbox.attributes.formvalue = k
                })
                subChild(styleContainer, "span", proxy => {
                    proxy.classList.add(proxyClass)
                })
            })
        })
    }

    let numRadioInputs = 0

    Object.entries(obj).forEach(([k, v]) => {
        let container = document.createElement('span')
        let child = document.createElement('input')
        // handle configured elements
        if (v.config) {
            if (v.config.validate) {
                callbacks[k + "-validate"] = v.config.validate
            }
            if (v.config.transform) {
                callbacks[k + "-transform"] = v.config.transform
            }
            if (v.config.lock) {
                callbacks[k + "-lock"] = v.config.lock
            }
            v = v.value
        }
        // turn into normal element
        switch (typeof v) {
            case "string":
                child.setAttribute("type", "text")
                child.setAttribute("placeholder", v)
                break
            case "number":
                child.setAttribute("type", "number")
                break
            case "boolean":
                child = document.createElement('span')
                child.classList.add("single-checkbox")
                child.type = "checkmark-container"
                subChild(child, "span", styleContainer => {
                    styleContainer.classList.add("container")
                    subChild(styleContainer, "input", realInput => {
                        realInput.attributes.formvalue = k
                        realInput.type = "checkbox"
                        realInput.checked = v
                    })
                    subChild(styleContainer, "span", proxy => {
                        proxy.classList.add("checkmark")
                    })
                })
                break
            case "object":
                switch (v.type) {
                    case "number":
                    case "range":
                        Object.entries(v).forEach(entry => child.setAttribute(entry[0], entry[1]))
                        break
                    case "radio":
                        child = document.createElement('span')
                        child.type = "radio-container"

                        v.options.forEach((option, i) => {
                            handleGroupElement(child, option, i, k, "radio", "radio")
                        })
                        numRadioInputs++
                        break
                    case "checkmark":
                        child = document.createElement('span')
                        child.type = "checkmark-container"

                        v.options.forEach((option, i) => {
                            handleGroupElement(child, option, i, k, "checkmark", "checkbox")
                        })
                        numRadioInputs++
                        break
                }
                break
        }
        child.attributes.formvalue = k
        child.oninput = change
        subChild(container, "label", label => {
            label.setAttribute("for", k)
            label.textContent = k
        })
        container.appendChild(child)
        f.appendChild(container)
    })
    return {
        onChange: callback
    }
}

function slider(min, max, val = min / max) {
    return {
        type: "range",
        min: min,
        max: max,
        value: val,
    }
}

function number(min, max, val = min / max) {
    return {
        type: "number",
        min: min,
        max: max,
        value: val,
    }
}

function radio(options) {
    const ret = { options: [] }
    options.forEach(option => {
        ret.options.push(option)
    })
    ret["type"] = "radio"
    return ret
}

function checkmark(options) {
    const ret = { options: [] }
    options.forEach(option => {
        ret.options.push(option)
    })
    ret["type"] = "checkmark"
    return ret
}

addEventListener('DOMContentLoaded', () => {
    document.querySelector('#formcontainer').appendChild(
        form("formit", {
            one: 1,
            two: "Test",
            "Custom name with %": false,
            four: slider(0, 10),
            five: radio(["one", "two", "three"]),
            six: checkmark(["four", "five", "six"])
        }).onChange((data) => console.log(data))
    )
    // document.querySelector('body').appendChild(
    //     form("formit", {
    //         one: {
    //             value: 1,
    //             config: {
    //                 transform: (v) => v*2
    //             }
    //         },
    //     }).onChange((data) => console.log(data))
    // )
});