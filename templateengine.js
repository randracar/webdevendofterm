class SimpleTemplateEngine {
    constructor(template_url) {
        this.template_url = template_url;
        this.template = '';
    }

    loadTemplate() {
        return fetch(this.template_url)
            .then(response => response.text())
            .then(text => {
                this.template = text;
            });
    }

    loadTemplateFromElement(selector) {
        const el = document.querySelector(selector);
        this.template = el ? el.textContent : '';
        return Promise.resolve();
    }

    renderTemplate(target, data) {
        const html = this._render(this.template, data);
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) {
            el.innerHTML = html;
        }
        return html;
    }

    _render(template, data) {
        let output = this._renderBlocks(template, 'each', (key, inner) => {
            const items = data[key];
            if (!Array.isArray(items)) return '';
            return items.map(item => {
                if (item !== null && typeof item === 'object') {
                    return this._render(inner, item);
                }
                return inner.split('{{this}}').join(String(item));
            }).join('');
        });

        output = this._renderBlocks(output, 'if', (key, inner) => {
            return data[key] ? this._render(inner, data) : '';
        });

        return output.replace(/{{\s*(\w+)\s*}}/g, (_match, key) => {
            const value = data[key];
            return value !== undefined && value !== null ? value : '';
        });
    }

    _renderBlocks(template, tag, handler) {
        const openPrefix = `{{#${tag} `;
        const closeTag = `{{/${tag}}}`;
        let output = '';
        let cursor = 0;

        while (true) {
            const start = template.indexOf(openPrefix, cursor);
            if (start === -1) {
                output += template.slice(cursor);
                break;
            }
            output += template.slice(cursor, start);

            const openEnd = template.indexOf('}}', start);
            const key = template.slice(start + openPrefix.length, openEnd).trim();

            let depth = 1;
            let searchPos = openEnd + 2;
            let innerEnd = -1;
            while (depth > 0) {
                const nextOpen = template.indexOf(openPrefix, searchPos);
                const nextClose = template.indexOf(closeTag, searchPos);
                if (nextClose === -1) {
                    throw new Error(`Unclosed {{#${tag}}} block for "${key}"`);
                }
                if (nextOpen !== -1 && nextOpen < nextClose) {
                    depth++;
                    searchPos = template.indexOf('}}', nextOpen) + 2;
                } else {
                    depth--;
                    innerEnd = nextClose;
                    searchPos = nextClose + closeTag.length;
                }
            }

            const inner = template.slice(openEnd + 2, innerEnd);
            output += handler(key, inner);
            cursor = innerEnd + closeTag.length;
        }

        return output;
    }
}