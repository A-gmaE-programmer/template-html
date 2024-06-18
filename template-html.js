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
            templateHolder.set(elm.id, elm.content.cloneNode(true));
        })
    element
        .querySelectorAll("[data-from]")
        .forEach(customElement => {
            const template = templateHolder.getNew(customElement.dataset.from);
            template
                .querySelectorAll("[data-attributes]")
                .forEach(elm => {
                    let passThruAttr = elm.dataset.attributes;
                    if (passThruAttr) {
                        passThruAttr
                            .split(' ')
                            .forEach(attr => {
                                const attrVal = customElement.getAttribute(attr);
                                if (attrVal || attrVal === "") {
                                    elm.setAttribute(attr, attrVal);
                                }
                            });
                    } else {
                        for (const attr of customElement.attributes)
                        {
                            if (attr.name == "data-from") { continue };
                            elm.setAttribute(attr.name, attr.value);
                        }
                    }
                    elm.removeAttribute('data-attributes');
                });
            template
                .querySelectorAll("[data-children]")
                .forEach(elm => {
                    customElement
                        .childNodes
                        .forEach(child => {
                            elm.appendChild(child);
                        })
                    elm.removeAttribute("data-children");
                })
            customElement.replaceWith(template);
        });
}
