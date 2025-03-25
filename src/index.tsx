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
        // find the <a> element with class 'title' and inject a <select> element after it
        findByProp(origin, 'class', 'title', 'a', (elem, indices) => {
            const index = indices.pop();
            const children = indices.reduce((arr, idx) => arr[idx], elem.children) as JSX.Children[];
            children.splice(
                index + 1,
                0,
                <select id='version-select' class='title loading' />,
            );
            return true; // no need to continue searching
        });
        return origin;
    }
}

function findByProp(
    root: JSX.Element,
    name: string,
    value: string,
    tagName?: string,
    cb?: (elem: JSX.Element, indices: number[]) => void) {
    function findInElement(parent: JSX.Element, element: JSX.Element, indices: number[]) {
        if ((tagName == null || element.tag === tagName) && element.props?.[name] === value) {
            if (cb) {
                return cb(parent, indices.slice());
            }
        }
        return findInChildren(element, [], element.children);
    }
    function findInChildren(parent: JSX.Element, indices: number[], children: JSX.Children[]) {
        const newIndices = indices.slice();
        newIndices.push(0);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            newIndices[newIndices.length - 1] = i;
            if (child == null) {
                continue;
            }
            if (Array.isArray(child)) { // child is JSX.Children[]
                if (findInChildren(parent, newIndices, child)) {
                    return true;
                };
                continue; // didn't find in the child(JSX.Children[]), try next child
            }
            if (typeof child === 'object') { // child is JSX.Element
                if (findInElement(parent, child, newIndices)) {
                    return true;
                };
            }
        }
        return false; // not found
    }

    findInChildren(root, [], root.children);
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

