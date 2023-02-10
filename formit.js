function form(formId, obj, preventDefault = true) {
    const callbacks = {}
    const f = document.createElement('form')
    f.id = formId

    function change() {
        let arg = obj
        f.querySelectorAll('input').forEach(e => {
            switch (e.type) {
                case "text":
                    arg[e.attributes.formvalue] = e.value
                    break
                case "checkbox":
                    if (typeof arg[e.attributes.formvalue] === 'boolean') {
                        arg[e.attributes.formvalue] = e.checked
                    } else {
                        if (!arg[e.attributes.formvalue].first) {
                            arg[e.attributes.formvalue].first = true
                            arg[e.attributes.formvalue].results = []
                        }
                        if (e.checked) {
                            arg[e.attributes.formvalue].results.push(e.value)
                        }
                    }
                    break
                case "range":
                    arg[e.attributes.formvalue] = parseInt(e.value)
                    break
                case "number":
                    arg[e.attributes.formvalue] = parseFloat(e.value)
                    break
                case "radio":
                    if (e.checked) {
                        arg[e.attributes.formvalue] = e.value
                    }
            }
        })
        Object.entries(arg).forEach(([k, v]) => {
            if (v.results) {
                arg[k] = v.results
            }
        })
        callbacks[formId](arg)
    }

    function callback(fn) {
        callbacks[formId] = fn
        return f
    }

    let numRadioInputs = 0

    Object.entries(obj).forEach(([k, v]) => {
        let container = document.createElement('span')
        let child = document.createElement('input')
        switch (typeof v) {
            case "string":
                child.setAttribute("type", "text")
                child.setAttribute("placeholder", v)
                break
            case "number":
                child.setAttribute("type", "number")
                break
            case "boolean":
                child.setAttribute("type", "checkbox")
                child.checked = v
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
                            const subChild = document.createElement("input")
                            if (i == 0) {
                                subChild.checked = "checked"//checked
                            }
                            const subContainer = document.createElement('span')
                            const styleContainer = document.createElement('span')
                            styleContainer.classList.add("container")
                            const checkmarkProxy = document.createElement('span')
                            checkmarkProxy.classList.add("radio")//checkmark
                            const label = document.createElement('label')
                            label.setAttribute("for", option)
                            label.textContent = option

                            subChild.type = "radio"
                            subChild.name = `${formId}-${numRadioInputs}`
                            subChild.id = `${subChild.name}-${option}`
                            subChild.value = option
                            subChild.attributes.formvalue = k

                            subContainer.appendChild(label)
                            styleContainer.appendChild(subChild)
                            styleContainer.appendChild(checkmarkProxy)
                            subContainer.appendChild(styleContainer)
                            child.appendChild(subContainer)
                        })
                        numRadioInputs++
                        break
                    case "checkmark":
                        child = document.createElement('span')
                        child.type = "checkmark-container"

                        v.options.forEach((option, i) => {
                            const subChild = document.createElement("input")
                            if (i == 0) {
                                subChild.checked = "checked"//checked
                            }
                            const subContainer = document.createElement('span')
                            const styleContainer = document.createElement('span')
                            styleContainer.classList.add("container")
                            const checkmarkProxy = document.createElement('span')
                            checkmarkProxy.classList.add("checkmark")//checkmark
                            const label = document.createElement('label')
                            label.setAttribute("for", option)
                            label.textContent = option

                            subChild.type = "checkbox"
                            subChild.name = `${formId}-${numRadioInputs}`
                            subChild.id = `${subChild.name}-${option}`
                            subChild.value = option
                            subChild.attributes.formvalue = k

                            subContainer.appendChild(label)
                            styleContainer.appendChild(subChild)
                            styleContainer.appendChild(checkmarkProxy)
                            subContainer.appendChild(styleContainer)
                            child.appendChild(subContainer)
                        })
                        numRadioInputs++
                        break
                }

                break
        }
        child.attributes.formvalue = k
        child.oninput = change
        const label = document.createElement('label')
        label.setAttribute("for", k)
        label.textContent = k
        container.appendChild(label)
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
    document.querySelector('body').appendChild(
        form("formit", {
            one: 1,
            two: "Test",
            three: false,
            four: slider(0, 10),
            five: radio(["one", "two", "three"]),
            six: checkmark(["four", "five", "six"])
        }).onChange((data) => console.log(data))
    )
    document.querySelector('body').appendChild(
        form("formit", {
            one: 1,
        }).onChange((data) => console.log(data))
    )
});