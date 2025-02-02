import * as fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Application, JSX, OutputSpecification, PageEvent, ParameterType, Reflection, Renderer } from 'typedoc';
import Mustache from 'mustache';

export function load(app: Application) {
    if (!app.outputs.getOutputSpecs().find(spec => spec.name === 'html')) {
        return;
    }

    setupArgument(app);
    setupPageInjector(app);
    setupAssets(app);
}

function setupArgument(app: Application) {
    app.options.addDeclaration({
        name: 'versionSpecHRef',
        help: 'href to the version spec file',
        type: ParameterType.String,
        defaultValue: '../versions.json'
    });
}

function setupPageInjector(app: Application) {
    app.renderer.hooks.on('head.end', (context) => {
        context.toolbar = toolbar(context.toolbar).bind(context);
        return <>
            <link rel="stylesheet" href={context.relativeURL("assets/version-select.css", true)} />
            <script src={context.relativeURL("assets/version-select.js", true)} />
        </>;
    });
}

function toolbar(toolbar: (props: PageEvent<Reflection>) => JSX.Element) {
    return function (props: PageEvent<Reflection>) {
        const origin = toolbar(props);
        const found = findByProp(origin, 'id', 'tsd-search');
        found.children.push(<select id='version-select' class='title loading' />);
        return origin;
    }
}

function findByProp(element: JSX.Element, name: string, value: string): JSX.Element | undefined {
    function findInElement(element: JSX.Element) {
        if (element.props?.[name] === value) {
            return element;
        }
        return findInChildren(element.children);
    }
    function findInChildren(children: JSX.Children[]) {
        for (const child of children) {
            if (child == null) {
                continue;
            }
            if (Array.isArray(child)) { // child is JSX.Children[]
                const found = findInChildren(child);
                if (found != null) {
                    return found;
                }
                continue; // didn't find in the child(JSX.Children[]), try next child
            }
            if (typeof child === 'object') { // child is JSX.Element
                const found = findInElement(child);
                if (found != null) {
                    return found;
                }
            }
        }
        return undefined; // not found
    }
    return findInElement(element);
}

function setupAssets(app: Application) {
    app.renderer.on(Renderer.EVENT_END, (event) => {
        const srcdir = dirname(fileURLToPath(import.meta.url));
        const dstdir = event.outputDirectory;
        const cssfile = 'assets/version-select.css';
        const jsfile = 'assets/version-select.js';
        fs.copyFileSync(join(srcdir, cssfile), join(dstdir, cssfile));

        const script = Mustache.render(
            fs.readFileSync(join(srcdir, jsfile + '.mustache'), 'utf-8'),
            { versionSpecHRef: app.options.getValue('versionSpecHRef') },
        );
        fs.writeFileSync(join(dstdir, jsfile), script);
    });
}

