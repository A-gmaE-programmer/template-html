/** Change this to false to prevent template substitution
 *  Change to a promise and template substitution will
 *  take place after the promise completes
 */
let processDOM = true;

/** Replace the target element with the template,
 *  filling out the template according to the target
 */
const insertTemplate =
(target, template) =>
{
    template
        .querySelectorAll("[data-attributes]")
        .forEach(elm => {
            let passThruAttr = elm.dataset.attributes;
            if (passThruAttr) {
                passThruAttr
                    .split(' ')
                    .forEach(attr => {
                        const attrVal = target.getAttribute(attr);
                        if (attrVal || attrVal === "") {
                            elm.setAttribute(attr, attrVal);
                        }
                    });
            } else {
                for (const attr of target.attributes)
                {
                    if (attr.name == "data-from") { continue };
                    elm.setAttribute(attr.name, attr.value);
                }
            }
            elm.removeAttribute('data-attributes');
        });
    template
        .querySelectorAll("[data-children-clone]")
        .forEach(elm => {
            target
                .childNodes
                .forEach(child => {
                    elm.appendChild(child.cloneNode(true));
                });
        });
    template
        .querySelectorAll("[data-children]")
        .forEach(elm => {
            let l = target.childNodes.length;
            for (;l > 0; l--) {
                elm.appendChild(target.childNodes[0]);
            }
            elm.removeAttribute("data-children");
        })
    target.replaceWith(template);
}

/** Look for templates and insert them where they should go
 * @param {HTMLElement} element
 */
const processTemplatedHtml = 
(element) => 
{
    const templateHolder = {
        /** @type {Map<string, DocumentFragment>} */
        templates: new Map(),
        /** @param {string} elementID */
        getNew (elementID) {
            if (this.templates.has(elementID)) {
                return this.templates.get(elementID).cloneNode(true);
            } else {
                return undefined;
            }
        },
        /** @param {string}           elementID 
         *  @param {DocumentFragment} docFrag */
        set (elementID, docFrag) {
            this.templates.set(elementID, docFrag);
        },
    }

    element
        .querySelectorAll("template")
        .forEach(elm => {
            templateHolder.set(elm.id, elm.content);
        });

    const fromElements = element.querySelectorAll("[data-from]")
    for (const ctmElm of fromElements) {
        const template = templateHolder.getNew(ctmElm.dataset.from);
        insertTemplate(ctmElm, template);
    }

    const customElementTemplates = element.querySelectorAll("[data-custom-element]")
    for (const ctmElmTpl of customElementTemplates) {
        if (ctmElmTpl.dataset.customElement == "replace") {
            element
                .querySelectorAll(ctmElmTpl.id)
                .forEach(elm => insertTemplate(elm, ctmElmTpl.content.cloneNode(true)))
        } else {
            const eName = ctmElmTpl.id
            customElements.define(eName, class extends HTMLElement {});
            const copyAttrs = [];
            for (const attr of ctmElmTpl.attributes) {
                if (attr.name == "data-custom-element") continue;
                if (attr.name == "id") continue;
                copyAttrs.push(attr);
            }
            element
                .querySelectorAll(eName)
                .forEach(elm => {
                    copyAttrs.forEach(attr => elm.setAttribute(attr.name, attr.value));
                });
        }
    }
}

document.addEventListener(
    "DOMContentLoaded", () => { 
        if (!processDOM) return;
        if (typeof processDOM == "boolean") {
            processTemplatedHtml(document.documentElement);
        }
        try {
            processDOM.then(() => processTemplatedHtml(document.documentElement));
        } catch (e) {
            console.error(e);
        }
    } 
);
