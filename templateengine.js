 	class SimpleTemplateEngine {
    constructor(template_url) {
        this.template_url = template_url;
    }

    loadTemplate() {
        return fetch(this.template_url)
            .then(response => response.text())
            .then(text => {
                this.template = text;
            });
    }
}
// Create an instance and load the template
const tEngine = new SimpleTemplateEngine('template.html');

tEngine.loadTemplate().then(() => {
    console.log('Template loaded:', tEngine.template);
});

const tEngine = new SimpleTemplateEngine('template.html');

const data = {
    title: 'Page title',
    content: 'Page content',
    subtitle: 'Page sub title',
    loggedIn: true,
    username: 'nobody',
    subcontent: 'Page sub content',
    items: [
        { title: 'item 1', description: 'Desc 1' },
        { title: 'item 2', description: 'desc 2' }
    ]
};

tEngine.loadTemplate().then(() => {
    console.log('Template loaded:', tEngine.template);
    tEngine.renderTemplate('content', data);
});